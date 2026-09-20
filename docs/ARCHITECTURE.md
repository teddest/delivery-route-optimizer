# Architecture

## Overview

The application has four layers:

```text
Next.js UI
   ↓
Next.js route handlers
   ↓
PostgreSQL/PostGIS
   ↓
OSRM road routing service
```

The UI is responsible for selecting shipments and displaying hubs/routes. The server performs database reads, shipment consolidation, relay-path selection, and OSRM requests.

## Runtime flow

### Load the planning problem

1. The browser requests `GET /api/linehaul/problem`.
2. The handler reads distribution centers, shipments, and linehaul vehicles from PostgreSQL.
3. The browser renders the hub map and shipment list.

### Optimize linehaul

1. The user clicks **Optimize linehaul**.
2. The browser sends `POST /api/linehaul/optimize`.
3. The server loads all distribution centers, shipments, and available linehaul vehicles.
4. OSRM creates a road-distance matrix between distribution centers.
5. Shipments are grouped by origin and destination.
6. Compatible shipments are consolidated into 26-pallet vehicle loads.
7. A relay path is calculated when a direct leg exceeds the maximum leg distance.
8. OSRM returns detailed street geometry and duration for each route.
9. The API returns routes to the browser.
10. The map draws the routes and can animate the selected route.

## Important modules

```text
src/app/page.tsx
  Main linehaul planning UI

src/components/linehaul-map.tsx
  Leaflet map, depot markers, route lines, route animation

src/app/api/linehaul/problem/route.ts
  Loads active depots, shipments, and linehaul vehicles

src/app/api/linehaul/optimize/route.ts
  Consolidates shipments and builds relay-aware routes

src/lib/osrm.ts
  OSRM table and route clients with retry behavior

src/lib/db.ts
  Shared PostgreSQL connection pool

src/types/linehaul.ts
  Shipment, depot, vehicle, and route types
```

## Mapping

Leaflet uses Esri World Street Map tiles for the basemap. OSRM supplies the route geometry. The basemap and routing service are separate concerns:

- Esri tiles: visualization
- OSRM: road network, distance, duration, and route geometry
- PostGIS: storage and spatial data types

## Production architecture

The public OSRM service should not be used for production volume. A production deployment should use one of:

- Self-hosted OSRM
- Self-hosted Valhalla
- A managed routing provider

A production optimizer should also move long-running optimization jobs to a worker queue instead of keeping the HTTP request open.
