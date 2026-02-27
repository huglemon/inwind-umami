# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev              # Start dev server on port 3001 (Next.js Turbo mode)

# Build
pnpm build            # Full production build (tracker + db client + app)
pnpm build-app        # Next.js app only
pnpm build-tracker    # Analytics tracker script (Rollup)
pnpm build-db         # Generate Prisma client

# Database
pnpm update-db        # Run Prisma migrations
pnpm check-db         # Verify database connection
pnpm seed-data        # Seed test data

# Testing
pnpm test             # Jest unit tests
pnpm cypress-open     # Cypress E2E (interactive)
pnpm cypress-run      # Cypress E2E (headless)

# Linting & Formatting
pnpm lint             # Biome lint
pnpm format           # Biome format
pnpm check            # Biome check + auto-fix
```

## Architecture

This is a fork of [Umami](https://umami.is) — a privacy-focused web analytics platform. It uses Next.js 15 App Router with PostgreSQL (metadata) and optionally ClickHouse (event data at scale).

### Data Flow

1. Tracker script (`public/script.js`, built from `src/tracker/`) is embedded on client websites
2. Events POST to `/api/send` → validated → written to PostgreSQL (`WebsiteEvent`) or ClickHouse
3. Dashboard reads from `src/queries/` which abstracts over both database backends

### Key Directories

- `src/app/` — Next.js App Router; `(main)/` for UI, `(collect)/` for tracker endpoints, `api/` for REST
- `src/queries/prisma/` — PostgreSQL queries via Prisma; `src/queries/sql/` — raw ClickHouse SQL
- `src/lib/` — shared utilities: `auth.ts` (JWT), `db.ts` (database abstraction), `clickhouse.ts`, `prisma.ts`
- `src/components/` — React components; `charts/` (Chart.js wrappers), `metrics/` (analytics displays)
- `src/store/` — Zustand stores for client state
- `src/lang/` — 50+ i18n locale files (React Intl / formatjs)
- `src/permissions/` — RBAC authorization logic
- `prisma/schema.prisma` — source of truth for PostgreSQL schema; Prisma client generated to `src/generated/prisma/`
- `db/clickhouse/` — ClickHouse schema and migrations

### Database

- Prisma ORM with `relationMode: "prisma"` (no foreign key constraints at DB level)
- Prisma client output: `src/generated/prisma` (not the default location)
- Run `pnpm build-db` after any schema change to regenerate the client
- ClickHouse is optional; the app falls back to PostgreSQL-only mode

### Authentication & Multi-tenancy

- JWT tokens, bcrypt passwords, SSO support
- Resources (websites, reports) belong to either a User or a Team
- Share tokens enable public/unauthenticated dashboard views

### Configuration

- Path alias `@/*` maps to `src/*`
- `next.config.ts`: standalone output, custom `BASE_PATH` support, CSP headers, API rewrites for tracker
- `biome.json`: 100-char line width, single quotes, trailing commas, a11y rules disabled
- TypeScript strict mode on, but `strictNullChecks` is off
- Pre-commit hook runs `lint-staged` with Biome

### Custom Features (vs upstream Umami)

- Link tracking (`src/app/(main)/links/`, `api/links/`)
- Pixel tracking (`src/app/(main)/pixels/`, `api/pixels/`)
- `ALLOWED_FRAME_URLS` env var for iframe embedding
