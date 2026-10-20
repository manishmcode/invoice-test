# Invoice

npm workspaces: `packages/invoice-types`, `backend` (Express), `frontend` (Next.js).

## Requirements

- Node `>=24.22.0` and npm `>=11.19.0` (see `.nvmrc` / `.node-version`)
- PostgreSQL (Docker Compose included)

## Setup

```bash
nvm use
docker compose up -d

npm install

cd backend
cp .env.example .env
npm run db:setup
npm run dev

cd ../frontend
cp .env.example .env.local
npm run dev
```

- App: http://localhost:3000
- API: http://localhost:3001

Without Docker, create a Postgres database, set `DATABASE_URL` in `backend/.env`, then run `npm run db:setup` from `backend/`.

## Environment

Do not commit `.env` or `.env.local`.

`backend/.env.example`

```
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://invoice:invoice@localhost:5432/invoice
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_ALLOWLIST=
```

`frontend/.env.example`

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Leave SMTP empty to skip mail. `MAIL_ALLOWLIST` is an optional comma-separated recipient list.

## Scripts

From the repo root:

```bash
npm test
npm run typecheck
npm run build
```
