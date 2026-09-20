# Data model

## Active linehaul tables

### `locations`

Shared spatial table. In the active scenario, rows whose names end with `Distribution Center` are the network hubs.

| Column | Description |
|---|---|
| `id` | Integer primary key |
| `name` | Depot or legacy location name |
| `address` | Display address or metro name |
| `source_id` | Source dataset identifier |
| `demand` | Legacy demand field; active depot rows use zero |
| `x`, `y` | Coordinate fields retained for compatibility |
| `location` | PostGIS `Point(4326)` geometry |
| `service_radius_miles` | Pickup service radius for a depot |

The active network uses `service_radius_miles = 150` for distribution centers.

### `shipments`

Represents LTL freight moving between hubs.

| Column | Description |
|---|---|
| `id` | Shipment identifier |
| `reference` | Human-readable shipment reference |
| `origin_depot_id` | Origin distribution center |
| `destination_depot_id` | Destination distribution center |
| `pallets` | Capacity consumed by the shipment |
| `weight_lbs` | Shipment weight |
| `delivery_deadline_hours` | Planning deadline from dispatch |
| `status` | `ready`, `planned`, or `in_transit` |

A shipment is not a local customer stop.

### `linehaul_vehicles`

Vehicles available for hub-to-hub freight.

| Column | Description |
|---|---|
| `id` | Vehicle identifier |
| `name` | Display name |
| `capacity_pallets` | Maximum consolidated pallet load |
| `home_depot_id` | Depot where the vehicle originates |

## Legacy tables

### `vehicles`

This table belongs to earlier local-stop and multi-depot experiments. The active linehaul optimizer uses `linehaul_vehicles` instead.

### `locations` legacy rows

Migrations `001` through `007` created local delivery-point scenarios for San Francisco, Oakland, Berkeley, Santa Clara, Salinas, Los Angeles, San Luis Obispo, and Fresno. Migration `008` truncates the active location data and rebuilds the eastern LTL depot network.

## Route response model

A planned route includes:

```text
origin depot
relay depot path
final destination depot
vehicle
shipments carried
pallet total
weight total
road distance
road duration
GeoJSON LineString geometry
```

## Capacity model

The current baseline uses a 26-pallet trailer capacity. Shipments are sorted by lane and packed until adding the next shipment would exceed capacity. A new route batch is then created.
