import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Location, Vehicle } from "@/types/routing";

export const dynamic = "force-dynamic";

type LocationRow = Location;

export async function GET() {
  try {
    const [locations, vehicles] = await Promise.all([
      db.query<LocationRow>(`
        SELECT id, name, demand, x, y,
          ST_X(location)::float8 AS lng,
          ST_Y(location)::float8 AS lat
        FROM locations ORDER BY id
      `),
      db.query<Vehicle>("SELECT id, name, capacity FROM vehicles ORDER BY id"),
    ]);

    return NextResponse.json({ locations: locations.rows, vehicles: vehicles.rows });
  } catch (error) {
    console.error("Failed to load routing problem", error);
    return NextResponse.json({ error: "Unable to load routing problem" }, { status: 500 });
  }
}
