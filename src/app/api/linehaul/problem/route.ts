import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { LinehaulDepot, LinehaulVehicle, Shipment } from "@/types/linehaul";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [depots, shipments, vehicles] = await Promise.all([
      db.query<LinehaulDepot>(`
        SELECT id, name, address,
          ST_X(location)::float8 AS lng,
          ST_Y(location)::float8 AS lat,
          service_radius_miles AS "serviceRadiusMiles"
        FROM locations
        WHERE name LIKE '%Distribution Center'
        ORDER BY name
      `),
      db.query<Shipment>(`
        SELECT
          id,
          reference,
          origin_depot_id AS "originDepotId",
          destination_depot_id AS "destinationDepotId",
          pallets,
          weight_lbs AS "weightLbs",
          delivery_deadline_hours AS "deliveryDeadlineHours",
          status
        FROM shipments
        ORDER BY id
      `),
      db.query<LinehaulVehicle>(`
        SELECT
          id,
          name,
          capacity_pallets AS "capacityPallets",
          home_depot_id AS "homeDepotId"
        FROM linehaul_vehicles
        ORDER BY id
      `),
    ]);

    return NextResponse.json({
      depots: depots.rows,
      shipments: shipments.rows,
      vehicles: vehicles.rows,
    });
  } catch (error) {
    console.error("Failed to load linehaul problem", error);
    return NextResponse.json({ error: "Unable to load linehaul problem" }, { status: 500 });
  }
}
