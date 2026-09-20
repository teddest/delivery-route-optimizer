# East Region LTL Network

A Next.js + PostgreSQL/PostGIS application for planning LTL freight movement between distribution centers east of the Mississippi River.

The application models **linehaul freight**, not last-mile delivery. A shipment moves from one distribution center to another, may use relay hubs, and is consolidated into vehicle loads.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [API reference](docs/API.md)
- [Routing and optimization](docs/ROUTING.md)
- [Seed data and migrations](docs/SEED_DATA.md)
- [Development and operations](docs/OPERATIONS.md)

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- PostgreSQL 16 with PostGIS 3.4
- Leaflet
- OSRM road routing
- `pg` for database access
- pnpm 10

## Current scenario

The final seed chain creates:

```text
66 distribution centers
155 shipments
332 linehaul vehicles
26-pallet vehicle capacity
```

The network includes denser hub coverage in Georgia, North Carolina, and South Carolina. Every distribution center has a 150-mile pickup service radius. Chattanooga has additional inbound and outbound freight lanes.

Examples include:

```text
Atlanta → Boston
Chicago → Boston
Miami → Philadelphia
Washington → Miami
Chicago → Cleveland → Albany → Boston
```

The last example uses relay distribution centers because direct linehaul legs are capped at approximately 500 miles.

## Quick start

Docker Desktop must be running.

```bash
pnpm install
pnpm db:reset
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The local database uses host port `5434`.

## Useful commands

```bash
pnpm dev          # Start the Next.js development server
pnpm build        # Create a production build
pnpm start        # Start the production server
pnpm lint         # Run ESLint

pnpm db:up        # Start PostGIS in the background
pnpm db:down      # Stop PostGIS and keep the volume
pnpm db:logs      # Follow PostgreSQL logs
pnpm db:reset     # Destroy and recreate the database (destructive)
```

## API quick reference

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/linehaul/problem
curl -X POST http://localhost:3000/api/linehaul/optimize
```

See the full [API reference](docs/API.md) for response structures and examples.

## Data and reset behavior

The Docker container runs every SQL file in `db/init/` in lexical order the first time its volume is created. The active network is produced by migrations `008` through `013`:

```text
db/init/008_seed_ltl_east_network.sql
db/init/009_seed_linehaul_network.sql
db/init/010_expand_east_150_mile_network.sql
db/init/011_expand_ga_carolinas.sql
db/init/012_seed_two_shipments_per_depot.sql
db/init/013_seed_chattanooga_lanes.sql
```

Earlier migrations are retained as historical seed work from prior map and routing experiments. Migration `008` clears the active location/local-vehicle tables, and later migrations build the current network on top of them.

Use `pnpm db:reset` after changing seed SQL. `pnpm db:down` does not delete data.

## Current limitations

- The optimizer is a deterministic baseline, not a full commercial LTL optimizer.
- Shipments are consolidated by origin/destination lane and pallet capacity.
- Relay paths use a maximum road-leg threshold and a transfer penalty.
- Driver hours, dock schedules, loading dwell, trailer availability over time, fuel cost, and tender acceptance are not modeled yet.
- OSRM's public endpoint is suitable for development and demos, not production traffic.
- The current route planner produces direct multi-leg relay paths; it does not yet model shipment transfer timing at each intermediate hub.
