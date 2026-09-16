# Delivery Route Optimizer

A Next.js + PostgreSQL/PostGIS application for exploring capacitated vehicle routing benchmarks.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- `pg` for database access

## Dataset

This app starts with the public **A-n32-k5** CVRP benchmark from [CVRPLIB](https://galgos.inf.puc-rio.br/cvrplib/en/instances).

The instance contains:

- 1 distribution center
- 31 delivery stops
- 5 vehicles
- Vehicle capacity of 100
- Customer demand values
- Benchmark best-known distance of 784

The original instance file is preserved at `data/A-n32-k5.vrp`.

The benchmark coordinates are planar EUC_2D coordinates. They are projected into the San Francisco area only to make the problem visible on a map; the displayed road map is illustrative, not part of the benchmark's distance calculation.

## Getting started

### Start PostgreSQL/PostGIS

Docker Desktop must be running.

```bash
pnpm db:up
```

This app uses host port `5434` so it can run alongside the Asset Explorer (`5432`) and Territory Planner (`5433`).

### Start the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### API endpoints

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/problem
curl -X POST http://localhost:3000/api/routes/optimize
```

## Database commands

```bash
pnpm db:up       # Start PostgreSQL/PostGIS in the background
pnpm db:down     # Stop the database and keep its data
pnpm db:logs     # Follow database logs
pnpm db:reset    # Delete the volume and recreate the database (destructive)
```

## Current functionality

- Load the A-n32-k5 problem from PostGIS
- Display the depot and customer stops on a Leaflet map
- Run a capacity-aware nearest-neighbor baseline optimizer
- Display generated vehicle routes on the map
- Show vehicle loads, stops, and route distance

The current optimizer is intentionally a baseline. The next step is replacing it with OR-Tools and comparing its result with the known benchmark value.

## Project structure

```text
src/app/api/problem/             Benchmark problem API
src/app/api/routes/optimize/     Baseline route optimization API
src/components/route-map.tsx     Leaflet map and route rendering
src/lib/db.ts                    Shared PostgreSQL connection pool
src/types/routing.ts             Shared route types
data/A-n32-k5.vrp                Original CVRPLIB instance
db/init/                         PostGIS schema and seed data
docker-compose.yml               Local PostGIS service
```
