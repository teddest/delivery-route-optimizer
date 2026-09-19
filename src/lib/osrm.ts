import type { Location } from "@/types/routing";

const OSRM_BASE_URL = "https://router.project-osrm.org";

async function fetchOsrm(url: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
      lastError = new Error(`OSRM request failed with ${response.status}`);
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }

  throw lastError ?? new Error("OSRM request failed");
}

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
  const response = await fetchOsrm(
    `${OSRM_BASE_URL}/table/v1/driving/${coordinateString(locations)}?annotations=distance,duration`,
  );
  const data: OsrmTableResponse = await response.json();
  if (data.code !== "Ok" || !data.distances || !data.durations) {
    throw new Error(`OSRM table request returned ${data.code}`);
  }

  return data;
}

export async function getRoadRoute(locations: Location[]) {
  const response = await fetchOsrm(
    `${OSRM_BASE_URL}/route/v1/driving/${coordinateString(locations)}?overview=full&geometries=geojson&steps=false`,
  );
  const data: OsrmRouteResponse = await response.json();
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) throw new Error(`OSRM route request returned ${data.code}`);

  return route;
}
