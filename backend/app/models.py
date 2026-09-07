from datetime import datetime, timezone
import secrets
import string

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_zone_id() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "Z" + "".join(secrets.choice(alphabet) for _ in range(21))


def generate_record_id() -> str:
    return "R" + secrets.token_hex(6).upper()


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def format_account_id(account_id: str) -> str:
    digits = "".join(ch for ch in account_id if ch.isdigit()).zfill(12)[:12]
    return f"{digits[:4]}-{digits[4:8]}-{digits[8:12]}"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120))
    account_id: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    sessions: Mapped[list["SessionToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    hosted_zones: Mapped[list["HostedZone"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    @property
    def account_id_formatted(self) -> str:
        return format_account_id(self.account_id)


class SessionToken(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="sessions")


class HostedZone(Base):
    __tablename__ = "hosted_zones"
    __table_args__ = (
        UniqueConstraint("owner_id", "name", name="uq_owner_zone_name"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_zone_id)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(16), default="Public")
    description: Mapped[str] = mapped_column(String(256), default="")
    comment: Mapped[str] = mapped_column(String(256), default="")
    created_by: Mapped[str] = mapped_column(String(64), default="Route 53")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    owner: Mapped[User] = relationship(back_populates="hosted_zones")
    records: Mapped[list["DnsRecord"]] = relationship(
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
    )

    @property
    def record_count(self) -> int:
        return len(self.records)


class DnsRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=generate_record_id)
    hosted_zone_id: Mapped[str] = mapped_column(
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str] = mapped_column(String(16), index=True)
    routing_policy: Mapped[str] = mapped_column(String(32), default="Simple")
    differentiator: Mapped[str] = mapped_column(String(64), default="-")
    alias: Mapped[bool] = mapped_column(Boolean, default=False)
    value: Mapped[str] = mapped_column(Text)
    ttl: Mapped[int | None] = mapped_column(Integer, nullable=True, default=300)
    health_check_id: Mapped[str] = mapped_column(String(64), default="-")
    evaluate_target_health: Mapped[str] = mapped_column(String(16), default="-")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
    )

    hosted_zone: Mapped[HostedZone] = relationship(back_populates="records")
