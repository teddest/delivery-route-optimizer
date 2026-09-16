import type { Location } from "@/types/routing";

const OSRM_BASE_URL = "https://router.project-osrm.org";

type OsrmTableResponse = {
  code: string;
  distances?: (number | null)[][];
  durations?: (number | null)[][];
};

type OsrmRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  }>;
};

function coordinateString(locations: Location[]) {
  return locations.map((location) => `${location.lng},${location.lat}`).join(";");
}

export async function getRoadMatrix(locations: Location[]) {
  const response = await fetch(
    `${OSRM_BASE_URL}/table/v1/driving/${coordinateString(locations)}?annotations=distance,duration`,
    { cache: "no-store" },
  );

  if (!response.ok) throw new Error(`OSRM table request failed with ${response.status}`);
  const data: OsrmTableResponse = await response.json();
  if (data.code !== "Ok" || !data.distances || !data.durations) {
    throw new Error(`OSRM table request returned ${data.code}`);
  }

  return data;
}

export async function getRoadRoute(locations: Location[]) {
  const response = await fetch(
    `${OSRM_BASE_URL}/route/v1/driving/${coordinateString(locations)}?overview=full&geometries=geojson&steps=false`,
    { cache: "no-store" },
  );

  if (!response.ok) throw new Error(`OSRM route request failed with ${response.status}`);
  const data: OsrmRouteResponse = await response.json();
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) throw new Error(`OSRM route request returned ${data.code}`);

  return route;
}
