# AWS Route 53 Clone

Functional clone of the AWS Route 53 console: auth, hosted zones, and DNS record CRUD with a FastAPI backend and persistent storage. UI/UX targets Cloudscape (AWS console) look and feel.

## Live demo

**App:** [https://route53.vishu.app](https://route53.vishu.app)

![Hosted zone UI — vishu.codes records in dark mode](./image.png)

Demo login (after seed):

| Field | Value |
|-------|--------|
| Email | `vishurizz0@example.com` |
| Password | `Amazon123!` |
| Account ID | `571600859548` |

IAM login: account ID + IAM user name `vishurizz0` + same password.

## Repository layout

```
scaler/
├── route53/          # Next.js (TypeScript) frontend
├── backend/          # FastAPI + SQLAlchemy API
├── image.png         # Hosted zone UI screenshot
└── README.md         # This file
```

| Package | Role |
|---------|------|
| `route53/` | Marketing landing, sign-in, console shell, hosted zones & records UI |
| `backend/` | REST API: auth sessions, zones, DNS records |

## Architecture

```
Browser (Next.js App Router)
    │  Authorization: Bearer <session token>
    ▼
FastAPI (uvicorn)
    │  SQLAlchemy ORM
    ▼
MySQL (Aiven / Railway / local)
```

**Frontend**

- Next.js App Router + Cloudscape Design System
- Session token in `localStorage` (`route53.auth.token`)
- API client under `route53/lib/api/` with a lightweight cache for zones/records
- Console chrome: top nav, sidebar, breadcrumbs; out-of-scope pages as placeholders

**Backend**

- FastAPI routers: `auth`, `hosted_zones`, `records`
- Bearer session tokens stored in `sessions` (TTL configurable)
- Creating a hosted zone seeds default **NS** + **SOA** records
- Default NS/SOA records cannot be deleted; NS/SOA type cannot be changed on update

**Auth model (mocked AWS-style)**

- Root user: email + password
- IAM-style: 12-digit account ID + IAM user name + password (same user row; IAM name matches display name)

## Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- MySQL database (Aiven free tier works)

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/defaultdb
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SESSION_TTL_HOURS=168
APP_NAME=Route53 Clone API
```

Use SQLAlchemy’s `mysql+pymysql://` scheme (not raw `mysql://`). TLS is enabled in code for Aiven.

```bash
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

- Health: http://127.0.0.1:8000/health
- OpenAPI docs: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
cd route53
cp .env.example .env.local
npm install
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Open http://localhost:3000 → Sign in.

### Production CORS

When the frontend is hosted elsewhere, add its origin to backend `CORS_ORIGINS` (comma-separated).

## Database schema

```
users
├── id (PK)
├── email (unique)
├── password_hash
├── display_name
├── account_id (unique, 12 digits)
└── created_at

sessions
├── id (PK)
├── token (unique)
├── user_id → users.id (CASCADE)
├── created_at
└── expires_at

hosted_zones
├── id (PK, e.g. Z…)
├── owner_id → users.id (CASCADE)
├── name (FQDN, unique per owner)
├── type (Public | Private)
├── description, comment, created_by
└── created_at

dns_records
├── id (PK, e.g. R…)
├── hosted_zone_id → hosted_zones.id (CASCADE)
├── name, type, routing_policy, differentiator
├── alias (bool)
├── value (text)
├── ttl (nullable; null when alias)
├── health_check_id, evaluate_target_health
├── created_at, updated_at
```

**Relationships:** User 1—* Session, User 1—* HostedZone, HostedZone 1—* DnsRecord.

**Supported record types:** A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, CAA, PTR.

## API overview

Base URL: `NEXT_PUBLIC_API_URL` (local default `http://127.0.0.1:8000`).

Protected routes require:

```http
Authorization: Bearer <token>
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Create user + session |
| `POST` | `/auth/login` | Root email/password → session |
| `POST` | `/auth/login/iam` | Account ID + IAM user + password |
| `POST` | `/auth/logout` | Revoke session |
| `GET` | `/auth/me` | Current user |

### Hosted zones

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/hosted-zones` | List zones for current user |
| `POST` | `/hosted-zones` | Create zone (+ default NS/SOA) |
| `GET` | `/hosted-zones/{id}` | Get zone |
| `PUT` | `/hosted-zones/{id}` | Update description/comment |
| `DELETE` | `/hosted-zones/{id}` | Delete zone and records |

### DNS records

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/hosted-zones/{zone_id}/records` | List records |
| `POST` | `/hosted-zones/{zone_id}/records` | Create one or more records |
| `GET` | `/records/{id}` | Get record |
| `PUT` | `/records/{id}` | Update record |
| `DELETE` | `/records/{id}` | Delete one record |
| `POST` | `/records/delete` | Batch delete (`[id, …]`) |

### Health

| Method | Path |
|--------|------|
| `GET` | `/health` |

Interactive docs: `/docs` (Swagger) and `/redoc`.

## Feature coverage

| Area | Status |
|------|--------|
| Login / logout / session | Done |
| Hosted zones CRUD + search/filter/pagination (client) | Done |
| DNS records CRUD + type-specific MX/SRV fields | Done |
| Console chrome, tables, forms, modals, flashes | Done |
| Dashboard / Health checks / Traffic policies / etc. | Placeholder / empty shell |
| BIND import/export | Not implemented (bonus) |

## License / assignment

Built for the Scaler AWS Route 53 clone assignment. Not affiliated with Amazon Web Services.
