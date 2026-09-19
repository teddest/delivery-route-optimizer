import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRoadRoute } from "@/lib/osrm";
import type { Location } from "@/types/routing";
import type { LinehaulDepot, LinehaulRoute, LinehaulVehicle, Shipment } from "@/types/linehaul";

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
    const vehicles = vehiclesResult.rows;
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

      let batch: Shipment[] = [];
      let batchPallets = 0;
      let batchWeight = 0;
      let batchNumber = 1;

      const flushBatch = async () => {
        if (!batch.length) return;

        const vehicle = vehicles.find(
          (candidate) => candidate.homeDepotId === originDepotId && !usedVehicles.has(candidate.id) && candidate.capacityPallets >= batchPallets,
        );
        if (!vehicle) throw new Error(`No available linehaul vehicle for ${origin.name} → ${destination.name}`);

        const roadRoute = await getRoadRoute([asLocation(origin), asLocation(destination)]);
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
          geometry: roadRoute.geometry,
        });
        batchNumber += 1;
        batch = [];
        batchPallets = 0;
        batchWeight = 0;
      };

      for (const shipment of laneShipments) {
        const capacity = vehicles.find((vehicle) => vehicle.homeDepotId === originDepotId)?.capacityPallets ?? 26;
        if (batch.length && batchPallets + shipment.pallets > capacity) await flushBatch();
        batch.push(shipment);
        batchPallets += shipment.pallets;
        batchWeight += shipment.weightLbs;
      }
      await flushBatch();
    }

    return NextResponse.json({ routes, shipments: shipmentsResult.rows, routingEngine: "OSRM" });
  } catch (error) {
    console.error("Failed to optimize linehaul routes", error);
    return NextResponse.json({ error: "Unable to optimize linehaul routes" }, { status: 502 });
  }
}
