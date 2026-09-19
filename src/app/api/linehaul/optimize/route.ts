import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoadMatrix, getRoadRoute } from "@/lib/osrm";
import type { Location } from "@/types/routing";
import type { LinehaulDepot, LinehaulRoute, LinehaulVehicle, Shipment } from "@/types/linehaul";

const MAX_LINEHAUL_LEG_METERS = 800_000;
const RELAY_TRANSFER_PENALTY_METERS = 25_000;

type HubPath = {
  depotIds: number[];
  distanceMeters: number;
};

function asLocation(depot: LinehaulDepot): Location {
  return {
    id: depot.id,
    name: depot.name,
    address: depot.address,
    sourceId: null,
    demand: 0,
    serviceRadiusMiles: depot.serviceRadiusMiles,
    x: depot.lng,
    y: depot.lat,
    lng: depot.lng,
    lat: depot.lat,
  };
}

function findRelayPath(
  originId: number,
  destinationId: number,
  depotIds: number[],
  distances: (number | null)[][],
  indexes: Map<number, number>,
): HubPath {
  const originIndex = indexes.get(originId);
  const destinationIndex = indexes.get(destinationId);
  if (originIndex === undefined || destinationIndex === undefined) throw new Error("Invalid linehaul depot path");

  const costs = new Map<number, number>(depotIds.map((id) => [id, Number.POSITIVE_INFINITY]));
  const previous = new Map<number, number>();
  const unvisited = new Set(depotIds);
  costs.set(originId, 0);

  while (unvisited.size > 0) {
    const current = [...unvisited].sort((a, b) => (costs.get(a) ?? Infinity) - (costs.get(b) ?? Infinity))[0];
    unvisited.delete(current);
    if (current === destinationId) break;
    if (!Number.isFinite(costs.get(current))) break;

    const currentIndex = indexes.get(current)!;
    for (const candidate of unvisited) {
      const candidateIndex = indexes.get(candidate)!;
      const legDistance = distances[currentIndex]?.[candidateIndex];
      if (legDistance === null || legDistance === undefined || legDistance > MAX_LINEHAUL_LEG_METERS) continue;

      const relayPenalty = current === originId ? 0 : RELAY_TRANSFER_PENALTY_METERS;
      const candidateCost = (costs.get(current) ?? Infinity) + legDistance + relayPenalty;
      if (candidateCost < (costs.get(candidate) ?? Infinity)) {
        costs.set(candidate, candidateCost);
        previous.set(candidate, current);
      }
    }
  }

  if (!Number.isFinite(costs.get(destinationId))) {
    throw new Error(`No relay path found from depot ${originId} to depot ${destinationId}`);
  }

  const path = [destinationId];
  let current = destinationId;
  while (current !== originId) {
    const parent = previous.get(current);
    if (parent === undefined) throw new Error("Unable to reconstruct relay path");
    path.unshift(parent);
    current = parent;
  }

  return { depotIds: path, distanceMeters: costs.get(destinationId)! };
}

export async function POST() {
  try {
    const [depotsResult, shipmentsResult, vehiclesResult] = await Promise.all([
      db.query<LinehaulDepot>(`
        SELECT id, name, address,
          ST_X(location)::float8 AS lng,
          ST_Y(location)::float8 AS lat,
          service_radius_miles AS "serviceRadiusMiles"
        FROM locations
        WHERE name LIKE '%Distribution Center'
      `),
      db.query<Shipment>(`
        SELECT id, reference, origin_depot_id AS "originDepotId",
          destination_depot_id AS "destinationDepotId", pallets,
          weight_lbs AS "weightLbs",
          delivery_deadline_hours AS "deliveryDeadlineHours", status
        FROM shipments
        WHERE status IN ('ready', 'planned')
        ORDER BY origin_depot_id, destination_depot_id, id
      `),
      db.query<LinehaulVehicle>(`
        SELECT id, name, capacity_pallets AS "capacityPallets", home_depot_id AS "homeDepotId"
        FROM linehaul_vehicles ORDER BY id
      `),
    ]);

    const depots = new Map(depotsResult.rows.map((depot) => [depot.id, depot]));
    const depotLocations = depotsResult.rows.map(asLocation);
    const depotIds = depotLocations.map((depot) => depot.id);
    const depotIndexes = new Map(depotIds.map((id, index) => [id, index]));
    const roadMatrix = await getRoadMatrix(depotLocations);
    const usedVehicles = new Set<number>();
    const shipmentsByLane = new Map<string, Shipment[]>();

    for (const shipment of shipmentsResult.rows) {
      const key = `${shipment.originDepotId}-${shipment.destinationDepotId}`;
      const lane = shipmentsByLane.get(key) ?? [];
      lane.push(shipment);
      shipmentsByLane.set(key, lane);
    }

    const routes: LinehaulRoute[] = [];

    for (const [laneKey, laneShipments] of shipmentsByLane) {
      const [originDepotId, destinationDepotId] = laneKey.split("-").map(Number);
      const origin = depots.get(originDepotId);
      const destination = depots.get(destinationDepotId);
      if (!origin || !destination) continue;

      const relayPath = findRelayPath(originDepotId, destinationDepotId, depotIds, roadMatrix.distances ?? [], depotIndexes);
      const relayNames = relayPath.depotIds.slice(1, -1).map((id) => depots.get(id)?.name ?? "Unknown hub");
      let batch: Shipment[] = [];
      let batchPallets = 0;
      let batchWeight = 0;
      let batchNumber = 1;

      const flushBatch = async () => {
        if (!batch.length) return;
        const vehicle = vehiclesResult.rows.find(
          (candidate) => candidate.homeDepotId === originDepotId && !usedVehicles.has(candidate.id) && candidate.capacityPallets >= batchPallets,
        );
        if (!vehicle) throw new Error(`No available linehaul vehicle for ${origin.name} → ${destination.name}`);

        const routeLocations = relayPath.depotIds.map((id) => asLocation(depots.get(id)!));
        const roadRoute = await getRoadRoute(routeLocations);
        usedVehicles.add(vehicle.id);
        routes.push({
          id: `${laneKey}-${batchNumber}`,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          originDepotId,
          destinationDepotId,
          originName: origin.name,
          destinationName: destination.name,
          shipmentIds: batch.map((shipment) => shipment.id),
          shipmentReferences: batch.map((shipment) => shipment.reference),
          pallets: batchPallets,
          weightLbs: batchWeight,
          distanceKm: Number((roadRoute.distance / 1000).toFixed(1)),
          durationMinutes: Math.round(roadRoute.duration / 60),
          relayDepotIds: relayPath.depotIds.slice(1, -1),
          relayNames,
          geometry: roadRoute.geometry,
        });
        batchNumber += 1;
        batch = [];
        batchPallets = 0;
        batchWeight = 0;
      };

      for (const shipment of laneShipments) {
        const capacity = vehiclesResult.rows.find((vehicle) => vehicle.homeDepotId === originDepotId)?.capacityPallets ?? 26;
        if (batch.length && batchPallets + shipment.pallets > capacity) await flushBatch();
        batch.push(shipment);
        batchPallets += shipment.pallets;
        batchWeight += shipment.weightLbs;
      }
      await flushBatch();
    }

    return NextResponse.json({ routes, shipments: shipmentsResult.rows, routingEngine: "OSRM", relayLegLimitMiles: 500 });
  } catch (error) {
    console.error("Failed to optimize linehaul routes", error);
    return NextResponse.json({ error: "Unable to optimize linehaul routes" }, { status: 502 });
  }
}
