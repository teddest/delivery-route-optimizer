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
      db.query<Vehicle>('SELECT id, name, capacity, depot_id AS "depotId" FROM vehicles ORDER BY id'),
    ]);

    const allLocations = locationsResult.rows;
    const locations = new Map(allLocations.map((location) => [location.id, location]));
    const locationIndexes = new Map(allLocations.map((location, index) => [location.id, index]));
    const depotIds = [...new Set(vehiclesResult.rows.map((vehicle) => vehicle.depotId))];
    const depots = new Map(
      depotIds.map((depotId) => {
        const depot = locations.get(depotId);
        if (!depot) throw new Error(`The routing problem has no location for depot ${depotId}.`);
        return [depotId, depot];
      }),
    );

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

    // Assign each delivery stop to the nearest depot by road distance. Vehicles
    // belonging to that depot then optimize only their assigned stops.
    const assignedStops = new Map<number, Set<number>>(depotIds.map((depotId) => [depotId, new Set()]));
    for (const location of allLocations) {
      if (depotIds.includes(location.id)) continue;

      const nearestDepotId = depotIds
        .sort((a, b) => roadDistance(locations.get(a)!, location) - roadDistance(locations.get(b)!, location))[0];
      assignedStops.get(nearestDepotId)?.add(location.id);
    }

    const routes: Route[] = [];

    for (const vehicle of vehiclesResult.rows) {
      const depot = depots.get(vehicle.depotId);
      const remaining = assignedStops.get(vehicle.depotId);
      const depotVehicles = vehiclesResult.rows.filter((candidate) => candidate.depotId === vehicle.depotId);
      const depotVehicleIndex = depotVehicles.findIndex((candidate) => candidate.id === vehicle.id);
      const routesRemaining = depotVehicles.length - depotVehicleIndex;
      if (!depot || !remaining || routesRemaining <= 0) continue;

      const targetStops = Math.max(1, Math.ceil(remaining.size / routesRemaining));
      const stops = [depot.id];
      let current = depot;
      let load = 0;
      let routeDistance = 0;

      while (remaining.size > 0 && stops.length - 1 < targetStops) {
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
          depotId: depot.id,
          depotName: depot.name,
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

    const unassigned = depotIds.flatMap((depotId) => [...(assignedStops.get(depotId) ?? [])]);

    return NextResponse.json({
      algorithm: "nearest-neighbor-capacity-greedy",
      routingEngine: "OSRM",
      depots: depotIds,
      routes: enrichedRoutes,
      unassigned: unassigned
        .map((id) => locations.get(id))
        .filter((location): location is Location => Boolean(location)),
    });
  } catch (error) {
    console.error("Failed to optimize routes", error);
    return NextResponse.json({ error: "Unable to optimize routes using road distances" }, { status: 502 });
  }
}
