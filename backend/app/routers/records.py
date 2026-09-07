from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import DnsRecord, User, utcnow
from app.schemas import (
    DnsRecordCreate,
    DnsRecordOut,
    DnsRecordUpdate,
    MessageOut,
)
from app.services.zones import get_owned_zone

router = APIRouter(tags=["records"])

ALLOWED_TYPES = {
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "TXT",
    "NS",
    "SOA",
    "SRV",
    "PTR",
    "CAA",
}


def _normalize_record_name(name: str, zone_name: str) -> str:
    cleaned = name.strip().lower()
    if cleaned in {"@", ""}:
        return zone_name
    if cleaned.endswith("."):
        return cleaned
    # Relative label → FQDN under the zone
    if cleaned.endswith(zone_name.rstrip(".")):
        return cleaned if cleaned.endswith(".") else f"{cleaned}."
    return f"{cleaned}.{zone_name}"


def _validate_type(record_type: str) -> str:
    upper = record_type.upper()
    if upper not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported record type. Allowed: {', '.join(sorted(ALLOWED_TYPES))}",
        )
    return upper


def _create_one(
    db: Session,
    zone_id: str,
    body: DnsRecordCreate,
    zone_name: str,
) -> DnsRecord:
    record = DnsRecord(
        hosted_zone_id=zone_id,
        name=_normalize_record_name(body.name, zone_name),
        type=_validate_type(body.type),
        routing_policy=body.routing_policy or "Simple",
        differentiator="-",
        alias=body.alias,
        value=body.value.strip(),
        ttl=None if body.alias else (body.ttl if body.ttl is not None else 300),
        health_check_id="-",
        evaluate_target_health="-",
    )
    db.add(record)
    return record


@router.get("/hosted-zones/{zone_id}/records", response_model=List[DnsRecordOut])
def list_records(
    zone_id: str,
    q: Optional[str] = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[DnsRecordOut]:
    zone = get_owned_zone(db, zone_id, user)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    records = (
        db.query(DnsRecord)
        .filter(DnsRecord.hosted_zone_id == zone_id)
        .order_by(DnsRecord.type.asc(), DnsRecord.name.asc())
        .all()
    )
    if q:
        needle = q.strip().lower()
        records = [
            r
            for r in records
            if needle in r.name.lower()
            or needle in r.type.lower()
            or needle in r.value.lower()
        ]
    return [DnsRecordOut.model_validate(r) for r in records]


@router.post(
    "/hosted-zones/{zone_id}/records",
    response_model=List[DnsRecordOut],
    status_code=status.HTTP_201_CREATED,
)
def create_records(
    zone_id: str,
    body: List[DnsRecordCreate] = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[DnsRecordOut]:
    zone = get_owned_zone(db, zone_id, user)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    if not body:
        raise HTTPException(status_code=400, detail="At least one record is required")

    created: List[DnsRecord] = []
    for item in body:
        created.append(_create_one(db, zone_id, item, zone.name))
    db.commit()
    for row in created:
        db.refresh(row)
    return [DnsRecordOut.model_validate(r) for r in created]


@router.get("/records/{record_id}", response_model=DnsRecordOut)
def get_record(
    record_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DnsRecordOut:
    record = db.query(DnsRecord).filter(DnsRecord.id == record_id).first()
    if not record or not get_owned_zone(db, record.hosted_zone_id, user):
        raise HTTPException(status_code=404, detail="Record not found")
    return DnsRecordOut.model_validate(record)


@router.put("/records/{record_id}", response_model=DnsRecordOut)
def update_record(
    record_id: str,
    body: DnsRecordUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DnsRecordOut:
    record = db.query(DnsRecord).filter(DnsRecord.id == record_id).first()
    zone = get_owned_zone(db, record.hosted_zone_id, user) if record else None
    if not record or not zone:
        raise HTTPException(status_code=404, detail="Record not found")

    if record.type in {"NS", "SOA"} and body.type and body.type.upper() != record.type:
        raise HTTPException(status_code=400, detail="Cannot change NS/SOA record type")

    if body.name is not None:
        record.name = _normalize_record_name(body.name, zone.name)
    if body.type is not None:
        record.type = _validate_type(body.type)
    if body.routing_policy is not None:
        record.routing_policy = body.routing_policy
    if body.alias is not None:
        record.alias = body.alias
        if body.alias:
            record.ttl = None
    if body.value is not None:
        record.value = body.value.strip()
    if body.ttl is not None and not record.alias:
        record.ttl = body.ttl

    record.updated_at = utcnow()
    db.commit()
    db.refresh(record)
    return DnsRecordOut.model_validate(record)


@router.delete("/records/{record_id}", response_model=MessageOut)
def delete_record(
    record_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    record = db.query(DnsRecord).filter(DnsRecord.id == record_id).first()
    if not record or not get_owned_zone(db, record.hosted_zone_id, user):
        raise HTTPException(status_code=404, detail="Record not found")
    if record.type in {"NS", "SOA"}:
        raise HTTPException(
            status_code=400,
            detail="Default NS and SOA records cannot be deleted",
        )
    db.delete(record)
    db.commit()
    return MessageOut(message="Record deleted")


@router.post("/records/delete", response_model=MessageOut)
def delete_records_batch(
    ids: List[str] = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    if not ids:
        raise HTTPException(status_code=400, detail="No record ids provided")

    deleted = 0
    for record_id in ids:
        record = db.query(DnsRecord).filter(DnsRecord.id == record_id).first()
        if not record or not get_owned_zone(db, record.hosted_zone_id, user):
            continue
        if record.type in {"NS", "SOA"}:
            continue
        db.delete(record)
        deleted += 1
    db.commit()
    return MessageOut(message=f"Deleted {deleted} record(s)")
