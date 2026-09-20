# Routing and optimization

## 1. Distribution-center network

The active network contains 66 distribution centers. Each hub has a 150-mile pickup service radius stored in `locations.service_radius_miles`.

The radius is a coverage-planning rule. It is not currently used to assign linehaul shipments because linehaul shipments already have explicit origin and destination depots.

## 2. Shipment consolidation

Shipments are grouped by:

```text
origin_depot_id + destination_depot_id
```

Within each lane:

1. Shipments are read in ID order.
2. Pallets are accumulated into a batch.
3. A batch is closed when the next shipment would exceed 26 pallets.
4. A linehaul vehicle with the matching home depot and enough capacity is assigned.

This means two shipments on the same lane can share a trailer:

```text
ATL-BOS-001: 12 pallets
ATL-BOS-002: 8 pallets
-----------------------
One route: 20 pallets
```

## 3. Relay path selection

A direct route is not always acceptable for an LTL network. The optimizer first creates an OSRM road-distance matrix between all distribution centers.

A graph is then built with:

- One node per distribution center
- An edge when the road leg is no more than 800,000 meters, approximately 500 miles
- Edge cost equal to road distance
- A 25-kilometer transfer penalty after the first leg

Dijkstra-style shortest-path selection finds the relay path. This can produce:

```text
Chicago → Cleveland → Albany → Boston
```

instead of a direct Chicago → Boston route.

The transfer penalty discourages unnecessary relays while the maximum-leg rule prevents very long direct legs from bypassing hubs.

## 4. Route geometry

After a relay path is selected, OSRM is called with the ordered hub coordinates as waypoints:

```text
route/v1/driving/
  Chicago;
  Cleveland;
  Albany;
  Boston
```

OSRM returns:

- Road distance
- Travel duration
- GeoJSON `LineString` geometry

The geometry is rendered by Leaflet and used by the route animation.

## 5. Current limitations

This is a baseline network optimizer. It does not yet model:

- Transfer dwell time at relay hubs
- Driver hours-of-service constraints
- Multiple shifts per vehicle
- Trailer availability over time
- Dock appointment windows
- Fuel, toll, or labor cost
- Shipment priority beyond deadline metadata
- Partial shipment splitting
- Backhauls and empty miles
- Network flow optimization across multiple days

## 6. Production evolution

A production-grade planner should move toward a time-expanded network model:

```text
shipments → feasible hub paths → time windows → vehicle/driver schedules
```

Potential solver options include OR-Tools CP-SAT, MILP, or a dedicated network-flow model. OSRM/Valhalla should provide the road matrix and leg geometry, while the optimization solver handles capacity, transfer, and scheduling constraints.
