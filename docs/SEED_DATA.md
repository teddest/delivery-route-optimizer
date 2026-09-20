# Seed data and migrations

## How Docker initialization works

`docker-compose.yml` mounts `db/init` into PostgreSQL's `/docker-entrypoint-initdb.d` directory.

PostgreSQL runs the SQL files in lexical order only when the data volume is created. A normal `pnpm db:down` keeps the volume and does not rerun the scripts.

To rerun all seed files:

```bash
pnpm db:reset
```

This is destructive. It removes the local PostgreSQL volume.

## Migration sequence

### `001_schema.sql`

Creates:

- PostGIS extension
- `locations`
- `vehicles`
- Spatial index on `locations.location`

It also contains the original CVRPLIB-style seed data.

### `002_seed_real_sf_addresses.sql`

Replaces the original abstract points with official San Francisco address points.

### `003_seed_oakland_berkeley_addresses.sql`

Adds Alameda County address points for Oakland and Berkeley.

### `004_seed_santa_clara_addresses.sql`

Adds City of Santa Clara address points.

### `005_seed_salinas_depot.sql`

Adds a Salinas depot, local stops, and vehicles.

### `006_seed_los_angeles_region.sql`

Adds Los Angeles, Oxnard, and Riverside planning locations and vehicles.

### `007_seed_slo_fresno.sql`

Adds San Luis Obispo and Fresno planning locations and vehicles.

### `008_seed_ltl_east_network.sql`

Switches the active location dataset to an eastern LTL hub network. It truncates the earlier location/local-vehicle data and creates the first 26 distribution centers.

### `009_seed_linehaul_network.sql`

Creates `shipments` and `linehaul_vehicles`, then seeds the first inter-depot freight lanes.

### `010_expand_east_150_mile_network.sql`

Adds additional planning hubs across the eastern United States.

### `011_expand_ga_carolinas.sql`

Adds denser hub coverage across Georgia, North Carolina, and South Carolina.

### `012_seed_two_shipments_per_depot.sql`

Ensures every distribution center has at least two outbound shipments and enough linehaul vehicle capacity.

### `013_seed_chattanooga_lanes.sql`

Adds additional inbound and outbound Chattanooga lanes.

## Changing seed data safely

When changing the active scenario:

1. Add a new numbered SQL file.
2. Make it idempotent with `ON CONFLICT` where appropriate.
3. If replacing active rows, use an explicit `TRUNCATE` and document it.
4. Run `pnpm db:reset`.
5. Verify counts with SQL.
6. Run `pnpm lint` and `pnpm build`.
7. Update this document and the README.

## Useful verification queries

```sql
-- Distribution-center count
SELECT count(*)
FROM locations
WHERE name LIKE '%Distribution Center';

-- Shipment count
SELECT count(*) FROM shipments;

-- Minimum outbound shipments by depot
SELECT
  d.id,
  d.name,
  count(s.id) AS outbound_shipments
FROM locations d
LEFT JOIN shipments s ON s.origin_depot_id = d.id
WHERE d.name LIKE '%Distribution Center'
GROUP BY d.id, d.name
ORDER BY outbound_shipments;

-- Vehicles by home depot
SELECT
  d.name,
  count(v.id) AS vehicles
FROM locations d
LEFT JOIN linehaul_vehicles v ON v.home_depot_id = d.id
WHERE d.name LIKE '%Distribution Center'
GROUP BY d.name
ORDER BY d.name;
```
