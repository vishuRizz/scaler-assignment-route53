from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

# Aiven MySQL requires TLS. Empty ssl dict enables REQUIRED-style encryption.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=280,
    connect_args={"ssl": {}},
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
