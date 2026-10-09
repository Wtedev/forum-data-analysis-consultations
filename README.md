# بوصلتك الجامعية | نموذج الاستشارات الأكاديمية

**madrak-consultations** — Arabic academic consultation request system (Madrak). This repository contains the Next.js application foundation, Prisma data layer, and deployment configuration.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Prisma ORM](https://www.prisma.io) 7 + PostgreSQL
- [Zod](https://zod.dev), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (for upcoming auth/API work)
- [Railway](https://railway.com) (deployment target)

## Local setup

1. **Clone and install**

   ```bash
   npm install
   ```

   `postinstall` runs `prisma generate` automatically.

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your local or hosted PostgreSQL URL and secrets. See [Environment variables](#environment-variables) below.

3. **Database** (after `DATABASE_URL` points to a reachable database)

   ```bash
   npm run prisma:dev      # create/apply migrations (first time: initial migration)
   npm run prisma:seed     # seed default admin (local dev only)
   ```

4. **Development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://...`) |
| `JWT_SECRET` | Yes | Secret for signing admin JWTs (use a long random value in production) |
| `NEXT_PUBLIC_APP_NAME` | No | Public app display name (default in example: بوصلتك الجامعية) |

Copy from `.env.example` only — **never commit `.env`**.

## Prisma commands

| Command | Purpose |
|---------|---------|
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:dev` | Create/apply migrations in development |
| `npm run prisma:migrate` | Apply pending migrations in production/staging |
| `npm run prisma:seed` | Run seed script (`prisma db seed`) |

Configuration: `prisma/schema.prisma`, `prisma.config.ts` (loads `DATABASE_URL` via `dotenv`).

## GitHub safety

- **Never commit `.env`** or any file containing real database URLs, JWT secrets, or API keys.
- Commit **`.env.example`** only (placeholders).
- `.gitignore` ignores `.env`, `.env.local`, and `.env.*.local` but allows `.env.example`.

## Railway deployment

1. Create a Railway project with a **PostgreSQL** plugin and a **Node.js** service for this app.
2. Set environment variables on the service (same names as local): `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_NAME`.
3. Deploy from GitHub; Nixpacks typically runs `npm install` (includes `postinstall` → `prisma generate`) then `npm run build`, then starts with `npm run start` (see `railway.json`).
4. **Migrations:** After the first deployment, run migrations against the production database explicitly, for example via Railway shell or a one-off job:

   ```bash
   npm run prisma:migrate
   ```

   Do **not** rely on automatic seeding in production.

5. **Do not** run `npm run prisma:seed` in production unless you intend to create/update the default admin.

## Default admin (local development)

The seed script creates or updates:

| Field | Value |
|-------|--------|
| Email | `admin@madrak.sa` |
| Password | `admin12345` |
| Role | `ADMIN` |

**Warning:** This password is for **local development only**. Change it before any shared, staging, or production use. Do not run the seed against production without rotating credentials immediately.

## Verification commands

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
npx tsc --noEmit
```

## Project status

Foundation (tooling, Prisma client, env templates, Railway config) is in place. Public consultation form and admin dashboard are not implemented yet.
