from __future__ import annotations

import random
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models import DnsRecord, HostedZone, User

NS_POOLS = [
    [
        "ns-149.awsdns-18.com.",
        "ns-1882.awsdns-43.co.uk.",
        "ns-1017.awsdns-63.net.",
        "ns-1276.awsdns-31.org.",
    ],
    [
        "ns-204.awsdns-25.com.",
        "ns-956.awsdns-55.net.",
        "ns-1422.awsdns-49.org.",
        "ns-1701.awsdns-20.co.uk.",
    ],
    [
        "ns-312.awsdns-39.com.",
        "ns-845.awsdns-41.net.",
        "ns-1102.awsdns-09.org.",
        "ns-1998.awsdns-57.co.uk.",
    ],
]


def normalize_zone_name(name: str) -> str:
    cleaned = name.strip().lower()
    if not cleaned.endswith("."):
        cleaned = f"{cleaned}."
    return cleaned


def seed_default_records(db: Session, zone: HostedZone) -> List[DnsRecord]:
    name_servers = random.choice(NS_POOLS)
    ns_value = "\n".join(name_servers)
    soa_value = (
        f"{name_servers[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
    )

    records = [
        DnsRecord(
            hosted_zone_id=zone.id,
            name=zone.name,
            type="NS",
            routing_policy="Simple",
            differentiator="-",
            alias=False,
            value=ns_value,
            ttl=172800,
            health_check_id="-",
            evaluate_target_health="-",
        ),
        DnsRecord(
            hosted_zone_id=zone.id,
            name=zone.name,
            type="SOA",
            routing_policy="Simple",
            differentiator="-",
            alias=False,
            value=soa_value,
            ttl=900,
            health_check_id="-",
            evaluate_target_health="-",
        ),
    ]
    db.add_all(records)
    return records


def get_owned_zone(db: Session, zone_id: str, user: User) -> Optional[HostedZone]:
    return (
        db.query(HostedZone)
        .filter(HostedZone.id == zone_id, HostedZone.owner_id == user.id)
        .first()
    )
