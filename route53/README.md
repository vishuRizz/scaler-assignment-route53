# Route 53 frontend

Next.js (TypeScript) UI for the AWS Route 53 console clone. Uses [Cloudscape Design System](https://cloudscape.design/) for AWS console look and feel.

Full project docs (setup, architecture, schema, API): see the [root README](../README.md).

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the FastAPI base URL (default `http://127.0.0.1:8000`).

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Layout

```
app/                 # App Router pages (landing, sign-in, console)
components/          # Console, hosted zones, records, landing, auth
lib/api/             # API client + cache
lib/auth/            # Session storage helpers
lib/constants/       # Form options, helpers
```

Demo login (after backend seed): `vishurizz0@example.com` / `Amazon123!`
