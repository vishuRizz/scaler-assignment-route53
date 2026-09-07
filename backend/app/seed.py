"""
Seed the demo user matching the frontend mock credentials.

Usage (from backend/):
  python -m app.seed
"""

from __future__ import annotations

from app.database import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password

DEMO = {
    "email": "vishurizz0@example.com",
    "password": "Amazon123!",
    "account_id": "571600859548",
    "display_name": "vishurizz0",
}


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO["email"]).first()
        if user:
            user.password_hash = hash_password(DEMO["password"])
            user.display_name = DEMO["display_name"]
            user.account_id = DEMO["account_id"]
            print(f"Updated demo user: {DEMO['email']}")
        else:
            user = User(
                email=DEMO["email"],
                password_hash=hash_password(DEMO["password"]),
                display_name=DEMO["display_name"],
                account_id=DEMO["account_id"],
            )
            db.add(user)
            print(f"Created demo user: {DEMO['email']}")
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
