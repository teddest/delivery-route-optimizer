# Delivery Route Optimizer

A Next.js + PostgreSQL/PostGIS application for exploring delivery routes with real Bay Area address points.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- `pg` for database access

## Data

The active scenario uses official address points from:

- [San Francisco Enterprise Addressing System](https://data.sf.gov/resource/3mea-di5p.json)
- [Alameda County Address Points](https://hub.arcgis.com/datasets/4610acbf49364583986d45ee4106cc3f)
- [City of Santa Clara Active Addresses](https://map.santaclaraca.gov/maps/rest/services/OPENDATA/CSCAddress_Active/MapServer/0)
- [City of Salinas Site Address Points](https://salinas-gis.ci.salinas.ca.us/arcgis/rest/services/Address/Site_Address_Points/FeatureServer/0)
- [LA County CAMS Address Points](https://services.arcgis.com/RmCCgQtiZLDCtblq/arcgis/rest/services/eGIS_Addressing_ADDRESS_POINTSv2/FeatureServer)
- [Riverside County Address Points](https://gis.countyofriverside.us/arcgis/rest/services/mmc/mmc_mSrvc/MapServer/4)
- [OpenStreetMap Oxnard address data](https://www.openstreetmap.org/)
- [City of San Luis Obispo Address Points](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/gisLandManagementWM/FeatureServer/2)
- [OpenStreetMap Fresno address data](https://www.openstreetmap.org/)

The app uses a deterministic farthest-point sample of 31 San Francisco customer addresses, 10 Oakland addresses, 10 Berkeley addresses, 10 Santa Clara addresses, 10 Salinas addresses, 8 Oxnard addresses, 8 Los Angeles addresses, 8 Riverside addresses, 10 San Luis Obispo addresses, and 10 Fresno addresses. It has five demonstration distribution centers: San Francisco, Salinas, Los Angeles, San Luis Obispo, and Fresno.

The original CVRPLIB `A-n32-k5` benchmark is preserved at `data/A-n32-k5.vrp` for future solver comparison. Its abstract coordinates are no longer used for the active map scenario.

The customer demand values remain from the benchmark so we can retain a repeatable capacity-constrained optimization problem while using realistic geographic points.

Routes are calculated against the public [OSRM](https://project-osrm.org/) street network. The optimizer requests a road-distance matrix, then fetches detailed road geometry and travel duration for each generated route. The public OSRM server is suitable for development and demos, not production-scale traffic.

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

- Load real Bay Area addresses from PostGIS
- Display both distribution centers and customer addresses on a Leaflet map
- Show address details in point popups
- Run a capacity-aware nearest-neighbor baseline optimizer
- Assign stops to the nearest depot by road distance
- Run five Bay Area vehicles, three Salinas vehicles, ten Los Angeles vehicles, three San Luis Obispo vehicles, and three Fresno vehicles
- Cover the regional corridor from San Luis Obispo and Fresno through Oxnard, Los Angeles, and Riverside
- Calculate road distance and duration using OSRM
- Display detailed street-following route geometry on the map
- Show vehicle loads, stops, route distance, duration, and depot

The current optimizer is intentionally a baseline. The next step is replacing the greedy assignment with OR-Tools while retaining the OSRM road matrix.

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
db/init/003_seed_oakland_berkeley_addresses.sql
                                  Real East Bay address migration
db/init/004_seed_santa_clara_addresses.sql
                                  Santa Clara address migration
db/init/005_seed_salinas_depot.sql
                                  Salinas depot, stops, and vehicles
db/init/006_seed_los_angeles_region.sql
                                  LA depot, regional stops, and vehicles
db/init/007_seed_slo_fresno.sql
                                  SLO and Fresno depots, stops, and vehicles
docker-compose.yml               Local PostGIS service
```
