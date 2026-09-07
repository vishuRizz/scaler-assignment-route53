from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user
from app.models import HostedZone, User
from app.schemas import HostedZoneCreate, HostedZoneOut, HostedZoneUpdate, MessageOut
from app.services.zones import get_owned_zone, normalize_zone_name, seed_default_records

router = APIRouter(prefix="/hosted-zones", tags=["hosted-zones"])


def _zone_out(zone: HostedZone) -> HostedZoneOut:
    return HostedZoneOut(
        id=zone.id,
        name=zone.name,
        type=zone.type,
        description=zone.description,
        comment=zone.comment,
        created_by=zone.created_by,
        record_count=len(zone.records),
        created_at=zone.created_at,
    )


@router.get("", response_model=List[HostedZoneOut])
def list_zones(
    q: Optional[str] = Query(default=None, description="Filter by name substring"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[HostedZoneOut]:
    query = (
        db.query(HostedZone)
        .options(joinedload(HostedZone.records))
        .filter(HostedZone.owner_id == user.id)
        .order_by(HostedZone.created_at.desc())
    )
    zones = query.all()
    if q:
        needle = q.strip().lower()
        zones = [z for z in zones if needle in z.name.lower() or needle in z.id.lower()]
    return [_zone_out(z) for z in zones]


@router.post("", response_model=HostedZoneOut, status_code=status.HTTP_201_CREATED)
def create_zone(
    body: HostedZoneCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    name = normalize_zone_name(body.name)
    exists = (
        db.query(HostedZone)
        .filter(HostedZone.owner_id == user.id, HostedZone.name == name)
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="Hosted zone already exists")

    zone = HostedZone(
        owner_id=user.id,
        name=name,
        type=body.type,
        description=body.description.strip(),
        comment=body.description.strip(),
        created_by="Route 53",
    )
    db.add(zone)
    db.flush()
    seed_default_records(db, zone)
    db.commit()
    db.refresh(zone)
    zone = (
        db.query(HostedZone)
        .options(joinedload(HostedZone.records))
        .filter(HostedZone.id == zone.id)
        .one()
    )
    return _zone_out(zone)


@router.get("/{zone_id}", response_model=HostedZoneOut)
def get_zone(
    zone_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    zone = (
        db.query(HostedZone)
        .options(joinedload(HostedZone.records))
        .filter(HostedZone.id == zone_id, HostedZone.owner_id == user.id)
        .first()
    )
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    return _zone_out(zone)


@router.put("/{zone_id}", response_model=HostedZoneOut)
def update_zone(
    zone_id: str,
    body: HostedZoneUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HostedZoneOut:
    zone = get_owned_zone(db, zone_id, user)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")

    if body.description is not None:
        zone.description = body.description.strip()
        zone.comment = zone.description

    db.commit()
    zone = (
        db.query(HostedZone)
        .options(joinedload(HostedZone.records))
        .filter(HostedZone.id == zone.id)
        .one()
    )
    return _zone_out(zone)


@router.delete("/{zone_id}", response_model=MessageOut)
def delete_zone(
    zone_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageOut:
    zone = get_owned_zone(db, zone_id, user)
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    db.delete(zone)
    db.commit()
    return MessageOut(message="Hosted zone deleted")
