# API reference

All endpoints are implemented as Next.js App Router route handlers.

## `GET /api/health`

Checks PostgreSQL and PostGIS connectivity.

Example:

```bash
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "database": "connected",
  "postgis": "POSTGIS=..."
}
```

## `GET /api/linehaul/problem`

Loads the active linehaul planning problem.

Response shape:

```json
{
  "depots": [
    {
      "id": 12,
      "name": "Atlanta Distribution Center",
      "address": "Atlanta, GA",
      "lng": -84.388,
      "lat": 33.749,
      "serviceRadiusMiles": 150
    }
  ],
  "shipments": [
    {
      "id": 1,
      "reference": "ATL-BOS-001",
      "originDepotId": 12,
      "destinationDepotId": 1,
      "pallets": 12,
      "weightLbs": 14500,
      "deliveryDeadlineHours": 48,
      "status": "ready"
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "name": "Atlanta Linehaul 01",
      "capacityPallets": 26,
      "homeDepotId": 12
    }
  ]
}
```

## `POST /api/linehaul/optimize`

Creates consolidated, relay-aware linehaul routes.

```bash
curl -X POST http://localhost:3000/api/linehaul/optimize
```

Response shape:

```json
{
  "routingEngine": "OSRM",
  "relayLegLimitMiles": 500,
  "routes": [
    {
      "id": "26-1-1",
      "vehicleId": 3,
      "vehicleName": "Chicago Linehaul 01",
      "originDepotId": 26,
      "destinationDepotId": 1,
      "originName": "Chicago Distribution Center",
      "destinationName": "Boston Distribution Center",
      "shipmentIds": [3],
      "shipmentReferences": ["CHI-BOS-001"],
      "pallets": 18,
      "weightLbs": 21400,
      "distanceKm": 1589,
      "durationMinutes": 1148,
      "relayDepotIds": [23, 2],
      "relayNames": [
        "Cleveland Distribution Center",
        "Albany Distribution Center"
      ],
      "geometry": {
        "type": "LineString",
        "coordinates": [[-87.6298, 41.8781]]
      }
    }
  ],
  "shipments": [],
  "unassigned": []
}
```

The actual geometry contains many coordinates; the example is abbreviated.

### Failure responses

Database, OSRM, path, or vehicle-capacity failures return HTTP `502`:

```json
{
  "error": "Unable to optimize linehaul routes"
}
```

## Legacy endpoints

The repository also contains earlier demo endpoints:

```text
GET  /api/problem
POST /api/routes/optimize
```

These belong to the previous location-stop optimizer and are not used by the active linehaul UI.
