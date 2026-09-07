from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User
from app.schemas import (
    AuthResponse,
    IamLoginRequest,
    LoginRequest,
    MessageOut,
    RegisterRequest,
    UserPublic,
)
from app.security import (
    create_session,
    hash_password,
    revoke_session,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])
bearer_scheme = HTTPBearer(auto_error=False)


def _user_public(user: User) -> UserPublic:
    return UserPublic(
        email=user.email,
        display_name=user.display_name,
        account_id=user.account_id,
        account_id_formatted=user.account_id_formatted,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Assign a unique 12-digit account id
    import secrets

    account_id = "".join(str(secrets.randbelow(10)) for _ in range(12))
    while db.query(User).filter(User.account_id == account_id).first():
        account_id = "".join(str(secrets.randbelow(10)) for _ in range(12))

    display = body.display_name.strip() or body.email.split("@")[0]
    user = User(
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        display_name=display,
        account_id=account_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    session = create_session(db, user)
    return AuthResponse(token=session.token, user=_user_public(user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    session = create_session(db, user)
    return AuthResponse(token=session.token, user=_user_public(user))


@router.post("/login/iam", response_model=AuthResponse)
def login_iam(body: IamLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    digits = "".join(ch for ch in body.account_id if ch.isdigit())
    user = db.query(User).filter(User.account_id == digits.zfill(12)[:12]).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid account or credentials")

    # Demo IAM: user_name must match display_name (case-insensitive)
    if body.user_name.strip().lower() != user.display_name.lower():
        raise HTTPException(status_code=401, detail="Invalid account or credentials")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid account or credentials")

    session = create_session(db, user)
    return AuthResponse(token=session.token, user=_user_public(user))


@router.post("/logout", response_model=MessageOut)
def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> MessageOut:
    if credentials and credentials.credentials:
        revoke_session(db, credentials.credentials)
    return MessageOut(message="Signed out")


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)) -> UserPublic:
    return _user_public(user)
