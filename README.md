# East Region LTL Network

A Next.js + PostgreSQL/PostGIS application for planning an LTL carrier network east of the Mississippi River.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- OSRM road routing
- `pg` for database access

## Active scenario

The active seed is defined in:

```text
db/init/008_seed_ltl_east_network.sql
```

It replaces the earlier regional demo data with:

- 26 distribution centers across the eastern United States
- A 150-mile geodesic service radius for every center
- 3 deterministic LTL account stops per center
- 3 vehicles per distribution center
- 78 vehicles total

The network includes hubs across New England, the Mid-Atlantic, the Southeast, the Great Lakes, and the Midwest while avoiding a St. Louis-style west-of-Mississippi hub.

The older geographic seed migrations remain in the repository for history and reproducibility. Migration `008` truncates the active tables and initializes the new LTL network as the final seed state.

## Reset and start

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
curl http://localhost:3000/api/problem
curl -X POST http://localhost:3000/api/routes/optimize
```

## Coverage rules

Each delivery stop is assigned to its nearest distribution center only when it falls inside that center's `service_radius_miles` value. Stops outside every service radius are returned as unassigned.

Route ordering uses OSRM street distances. Detailed route geometry and drive durations are also fetched from OSRM. The geographic assignment step uses the Haversine distance to keep OSRM table requests small enough for the public development service.

The public OSRM endpoint is appropriate for development and demos, not production-scale planning. A production deployment should run a dedicated OSRM/Valhalla instance or use a hosted routing provider.

## Current functionality

- Select from 26 distribution centers
- Filter routes by selected distribution center
- Display the eastern network on a dominant map workspace
- Enforce 150-mile service-radius coverage
- Generate three LTL routes per center
- Use actual street-following route geometry
- Animate a selected vehicle route
- Show unassigned stops when coverage rules are violated

## Project structure

```text
src/app/api/problem/             LTL network problem API
src/app/api/routes/optimize/     Multi-depot route optimization API
src/components/route-map.tsx     Leaflet map and route rendering
src/lib/osrm.ts                  OSRM table and route client
src/lib/db.ts                    Shared PostgreSQL connection pool
src/types/routing.ts             Shared route types
data/A-n32-k5.vrp                Original CVRPLIB reference instance
db/init/008_seed_ltl_east_network.sql
                                  Active eastern LTL network seed
docker-compose.yml               Local PostGIS service
```
