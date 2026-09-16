import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Location, Route, Vehicle } from "@/types/routing";

function distance(from: Location, to: Location) {
  const earthRadiusKm = 6371;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export async function POST() {
  try {
    const [locationsResult, vehiclesResult] = await Promise.all([
      db.query<Location>(`
        SELECT id, name, address, source_id AS "sourceId", demand, x, y,
          ST_X(location)::float8 AS lng,
          ST_Y(location)::float8 AS lat
        FROM locations ORDER BY id
      `),
      db.query<Vehicle>("SELECT id, name, capacity FROM vehicles ORDER BY id"),
    ]);

    const locations = new Map(locationsResult.rows.map((location) => [location.id, location]));
    const depot = locations.get(1);
    if (!depot) throw new Error("The routing problem has no depot.");

    const remaining = new Set(locationsResult.rows.filter((location) => location.id !== depot.id).map((location) => location.id));
    const routes: Route[] = [];

    for (const vehicle of vehiclesResult.rows) {
      const stops = [depot.id];
      let current = depot;
      let load = 0;
      let routeDistance = 0;

      while (remaining.size > 0) {
        const next = [...remaining]
          .map((id) => locations.get(id))
          .filter((location): location is Location => {
            if (!location) return false;
            return load + location.demand <= vehicle.capacity;
          })
          .sort((a, b) => distance(current, a) - distance(current, b))[0];

        if (!next) break;

        stops.push(next.id);
        remaining.delete(next.id);
        load += next.demand;
        routeDistance += distance(current, next);
        current = next;
      }

      if (stops.length > 1) {
        stops.push(depot.id);
        routeDistance += distance(current, depot);
        routes.push({
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          stops,
          load,
          distance: Number(routeDistance.toFixed(2)),
        });
      }
    }

    return NextResponse.json({
      algorithm: "nearest-neighbor-capacity-greedy",
      routes,
      unassigned: [...remaining].map((id) => locations.get(id)).filter(Boolean),
    });
  } catch (error) {
    console.error("Failed to optimize routes", error);
    return NextResponse.json({ error: "Unable to optimize routes" }, { status: 500 });
  }
}
