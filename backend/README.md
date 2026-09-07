# Route53 Clone — FastAPI backend

MySQL-backed API for auth, hosted zones, and DNS records. Uses Aiven (or any MySQL) via `DATABASE_URL`.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then set DATABASE_URL
```

### Database URL (Aiven)

Use SQLAlchemy’s PyMySQL URL (not the raw `mysql://` URI from Aiven):

```
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/defaultdb
```

TLS is enabled in code (`connect_args={"ssl": {}}`). Do not commit `.env`.

### Seed demo user

Matches the frontend mock account:

```bash
python -m app.seed
```

- Email: `vishurizz0@example.com`
- Password: `Amazon123!`
- Account ID: `571600859548`

### Run

```bash
uvicorn app.main:app --reload --port 8000
```

- Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

CORS defaults to `http://localhost:3000` and `http://127.0.0.1:3000`.

## Auth

Send `Authorization: Bearer <token>` on protected routes.

| Method | Path | Notes |
|--------|------|--------|
| POST | `/auth/register` | Create account + session |
| POST | `/auth/login` | Root email/password |
| POST | `/auth/login/iam` | Account ID + IAM user name + password |
| POST | `/auth/logout` | Revoke session |
| GET | `/auth/me` | Current user |

## Hosted zones

| Method | Path |
|--------|------|
| GET | `/hosted-zones` |
| POST | `/hosted-zones` |
| GET | `/hosted-zones/{id}` |
| PUT | `/hosted-zones/{id}` |
| DELETE | `/hosted-zones/{id}` |

Creating a zone seeds default **NS** + **SOA** records.

## DNS records

| Method | Path |
|--------|------|
| GET | `/hosted-zones/{zone_id}/records` |
| POST | `/hosted-zones/{zone_id}/records` |
| GET | `/records/{id}` |
| PUT | `/records/{id}` |
| DELETE | `/records/{id}` |
| POST | `/records/delete` | Body: JSON array of ids |

Default NS/SOA records cannot be deleted.

## Security note

If database credentials were shared in chat, rotate the Aiven password and update `.env`.
