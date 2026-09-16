import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoadMatrix, getRoadRoute } from "@/lib/osrm";
import type { Location, Route, Vehicle } from "@/types/routing";

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

    const allLocations = locationsResult.rows;
    const locations = new Map(allLocations.map((location) => [location.id, location]));
    const locationIndexes = new Map(allLocations.map((location, index) => [location.id, index]));
    const depot = locations.get(1);
    if (!depot) throw new Error("The routing problem has no depot.");

    const roadMatrix = await getRoadMatrix(allLocations);
    const roadDistance = (from: Location, to: Location) => {
      const fromIndex = locationIndexes.get(from.id);
      const toIndex = locationIndexes.get(to.id);
      const distance = fromIndex === undefined || toIndex === undefined
        ? null
        : roadMatrix.distances?.[fromIndex]?.[toIndex];

      if (distance === null || distance === undefined) {
        throw new Error(`No road distance found between ${from.id} and ${to.id}`);
      }

      return distance;
    };

    const remaining = new Set(allLocations.filter((location) => location.id !== depot.id).map((location) => location.id));
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
          .sort((a, b) => roadDistance(current, a) - roadDistance(current, b))[0];

        if (!next) break;

        stops.push(next.id);
        remaining.delete(next.id);
        load += next.demand;
        routeDistance += roadDistance(current, next);
        current = next;
      }

      if (stops.length > 1) {
        stops.push(depot.id);
        routeDistance += roadDistance(current, depot);
        routes.push({
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          stops,
          load,
          distance: Number((routeDistance / 1000).toFixed(2)),
          durationMinutes: 0,
        });
      }
    }

    const enrichedRoutes = await Promise.all(
      routes.map(async (route) => {
        const routeLocations = route.stops
          .map((id) => locations.get(id))
          .filter((location): location is Location => Boolean(location));
        const roadRoute = await getRoadRoute(routeLocations);

        return {
          ...route,
          durationMinutes: Math.round(roadRoute.duration / 60),
          geometry: roadRoute.geometry,
        };
      }),
    );

    return NextResponse.json({
      algorithm: "nearest-neighbor-capacity-greedy",
      routingEngine: "OSRM",
      routes: enrichedRoutes,
      unassigned: [...remaining]
        .map((id) => locations.get(id))
        .filter((location): location is Location => Boolean(location)),
    });
  } catch (error) {
    console.error("Failed to optimize routes", error);
    return NextResponse.json({ error: "Unable to optimize routes using road distances" }, { status: 502 });
  }
}
