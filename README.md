# Delivery Route Optimizer

A Next.js + PostgreSQL/PostGIS application for exploring delivery routes with real San Francisco address points.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- `pg` for database access

## Data

The active scenario uses the **San Francisco Addresses - Enterprise Addressing System** dataset from the City and County of San Francisco:

```text
https://data.sf.gov/resource/3mea-di5p.json
```

It contains official address points, street addresses, neighborhoods, and longitude/latitude coordinates. The app uses a deterministic farthest-point sample of 31 customer addresses plus `701 MARKET ST` as the demonstration distribution center.

The original CVRPLIB `A-n32-k5` benchmark is preserved at `data/A-n32-k5.vrp` for future solver comparison. Its abstract coordinates are no longer used for the active map scenario.

The customer demand values remain from the benchmark so we can retain a repeatable capacity-constrained optimization problem while using realistic geographic points.

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

- Load real San Francisco addresses from PostGIS
- Display the depot and customer addresses on a Leaflet map
- Show address details in point popups
- Run a capacity-aware nearest-neighbor baseline optimizer
- Calculate great-circle distance in kilometers
- Display generated vehicle routes on the map
- Show vehicle loads, stops, and route distance

The current optimizer is intentionally a baseline. The next step is using OSRM or Valhalla to calculate a road-travel matrix, then replacing the great-circle cost with actual driving distance and duration.

## Project structure

```text
src/app/api/problem/             Real address problem API
src/app/api/routes/optimize/     Baseline route optimization API
src/components/route-map.tsx     Leaflet map and route rendering
src/lib/db.ts                    Shared PostgreSQL connection pool
src/types/routing.ts             Shared route types
data/A-n32-k5.vrp                Original CVRPLIB benchmark
db/init/001_schema.sql           Base schema and benchmark seed
db/init/002_seed_real_sf_addresses.sql
                                  Real San Francisco address migration
docker-compose.yml               Local PostGIS service
```
