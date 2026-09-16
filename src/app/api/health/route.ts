import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query<{ postgis_version: string }>("SELECT PostGIS_Full_Version() AS postgis_version");
    return NextResponse.json({ status: "ok", database: "connected", postgis: result.rows[0]?.postgis_version });
  } catch (error) {
    console.error("Database health check failed", error);
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503 });
  }
}
