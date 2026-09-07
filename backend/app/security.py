from __future__ import annotations

from datetime import timedelta
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import SessionToken, User, generate_session_token, utcnow

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_session(db: Session, user: User) -> SessionToken:
    token = SessionToken(
        token=generate_session_token(),
        user_id=user.id,
        expires_at=utcnow() + timedelta(hours=settings.session_ttl_hours),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_user_by_token(db: Session, token: str) -> Optional[User]:
    if not token:
        return None
    row = db.query(SessionToken).filter(SessionToken.token == token).first()
    if not row:
        return None
    expires = row.expires_at
    if expires.tzinfo is None:
        # MySQL may return naive datetimes
        from datetime import timezone

        expires = expires.replace(tzinfo=timezone.utc)
    if expires < utcnow():
        db.delete(row)
        db.commit()
        return None
    return row.user


def revoke_session(db: Session, token: str) -> None:
    row = db.query(SessionToken).filter(SessionToken.token == token).first()
    if row:
        db.delete(row)
        db.commit()
