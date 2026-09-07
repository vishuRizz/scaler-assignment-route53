from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    display_name: str
    account_id: str
    account_id_formatted: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    method: str = "root"


class IamLoginRequest(BaseModel):
    account_id: str = Field(min_length=1)
    user_name: str = Field(min_length=1)
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    display_name: str = Field(default="", max_length=120)


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=256)
    type: str = Field(default="Public", pattern="^(Public|Private)$")


class HostedZoneUpdate(BaseModel):
    description: str | None = Field(default=None, max_length=256)


class HostedZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    description: str
    comment: str
    created_by: str
    record_count: int
    created_at: datetime


class DnsRecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=16)
    routing_policy: str = Field(default="Simple", max_length=32)
    alias: bool = False
    value: str = Field(min_length=1)
    ttl: int | None = Field(default=300, ge=0)


class DnsRecordUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    type: str | None = Field(default=None, max_length=16)
    routing_policy: str | None = Field(default=None, max_length=32)
    alias: bool | None = None
    value: str | None = None
    ttl: int | None = Field(default=None, ge=0)


class DnsRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    hosted_zone_id: str
    name: str
    type: str
    routing_policy: str
    differentiator: str
    alias: bool
    value: str
    ttl: int | None
    health_check_id: str
    evaluate_target_health: str
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    message: str
