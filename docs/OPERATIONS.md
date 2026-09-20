# Development and operations

## Prerequisites

- Node.js compatible with Next.js 16
- pnpm 10
- Docker Desktop
- Network access to the OSRM public API for route optimization

The repository declares its package manager in `package.json`:

```json
"packageManager": "pnpm@10.33.2"
```

## Environment

Copy the example environment file if needed:

```bash
cp .env.example .env.local
```

Default connection string:

```text
postgresql://optimizer:optimizer@localhost:5434/route_optimizer
```

`.env.local` is ignored by git. `.env.example` is committed.

## Local workflow

```bash
pnpm install
pnpm db:up
pnpm dev
```

Run validation before committing:

```bash
pnpm lint
pnpm build
```

## PostgreSQL operations

```bash
pnpm db:logs
pnpm db:down
pnpm db:reset
```

Inspect the container:

```bash
docker compose ps
docker exec -it delivery-route-optimizer-db \
  psql -U optimizer -d route_optimizer
```

The health check uses `pg_isready` and the application health endpoint verifies PostGIS.

## OSRM operations

The application calls:

```text
https://router.project-osrm.org
```

The client retries failed and rate-limited requests three times with a short backoff. Optimization can still take time because it requests:

- One table matrix for the distribution-center network
- One route geometry request for each planned load

For production, configure a private OSRM/Valhalla endpoint in `src/lib/osrm.ts` or move the URL to an environment variable.

## Troubleshooting

### Database connection failure

Check:

```bash
docker compose ps
curl http://localhost:3000/api/health
```

If the schema is stale:

```bash
pnpm db:reset
```

### OSRM optimization failure

Check the development server logs. Common causes include:

- Public OSRM rate limits
- Temporary routing service failures
- Invalid coordinates
- No relay path under the 500-mile maximum leg rule
- No available vehicle at the shipment origin

### Routes are not visible

The map only draws routes after clicking **Optimize linehaul**. Select a shipment or planned route in the sidebar to fit and animate the route.

### Seed changes are not visible

PostgreSQL initialization scripts run only for a new data volume. Use `pnpm db:reset`; restarting the container alone is not enough.

## Commits

Use focused commits with imperative messages, for example:

```text
feat: add Chattanooga inbound and outbound lanes
fix: guard route animation coordinates
chore: expand eastern 150 mile network
```
