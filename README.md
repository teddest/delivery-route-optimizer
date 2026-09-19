# East Region LTL Network

A Next.js + PostgreSQL/PostGIS application for planning LTL freight movement between distribution centers east of the Mississippi River.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- OSRM road routing
- `pg` for database access

## Active scenario

The active network is seeded by:

```text
db/init/008_seed_ltl_east_network.sql
db/init/009_seed_linehaul_network.sql
db/init/010_expand_east_150_mile_network.sql
```

It contains:

- 50 distribution centers across the eastern United States
- A denser 150-mile service-radius network for pickup coverage
- 15 LTL shipments between distribution centers
- 88 linehaul vehicles with 26-pallet capacity
- Freight lanes such as Atlanta → Boston, Chicago → Boston, Miami → Philadelphia, and Washington → Miami

The earlier regional stop seed data remains in the repository for history. Migration `008` replaces the active location and local-vehicle tables, migration `009` adds the active linehaul shipment and vehicle model, and migration `010` expands the hub network.

## Getting started

Docker Desktop must be running.

```bash
pnpm db:reset
pnpm dev
```

The database uses host port `5434`.

Open [http://localhost:3000](http://localhost:3000).

## API endpoints

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/linehaul/problem
curl -X POST http://localhost:3000/api/linehaul/optimize
```

## Linehaul model

A shipment moves between two distribution centers. It is not modeled as a local customer stop.

```text
shipments
  origin_depot_id
  destination_depot_id
  pallets
  weight_lbs
  delivery_deadline_hours

linehaul_vehicles
  home_depot_id
  capacity_pallets
```

The optimizer groups compatible shipments by origin and destination, consolidates them into vehicle loads, and calculates the direct OSRM road route between the two hubs.

The planner builds a relay path through distribution centers when a direct leg exceeds 500 miles. For example:

```text
Chicago → Cleveland → Albany → Boston
```

This prevents long-haul shipments from bypassing the distribution-center network while still using OSRM street routes for every leg.

## Current functionality

- Select and inspect distribution-center-to-distribution-center shipments
- Consolidate compatible shipments into 26-pallet linehaul loads
- Generate multi-leg linehaul routes through relay distribution centers
- Display road-following route geometry
- Show distance, duration, pallets, weight, and shipment references
- Animate a selected linehaul route on the map

The public OSRM endpoint is suitable for development and demos, not production-scale planning. A production deployment should run a dedicated OSRM/Valhalla instance or use a hosted routing provider.

## Project structure

```text
src/app/api/linehaul/problem/      Linehaul network and shipment API
src/app/api/linehaul/optimize/     Direct linehaul optimization API
src/components/linehaul-map.tsx    Hub and route map
src/lib/osrm.ts                    OSRM route client
src/lib/db.ts                      Shared PostgreSQL connection pool
src/types/linehaul.ts              Shipment and route types
db/init/008_seed_ltl_east_network.sql
                                   Eastern distribution-center network
db/init/009_seed_linehaul_network.sql
                                   Shipments and linehaul vehicles
db/init/010_expand_east_150_mile_network.sql
                                   Additional 150-mile coverage hubs
docker-compose.yml                 Local PostGIS service
```
