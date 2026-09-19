"use client";

import { useEffect, useState } from "react";
import { RouteMap } from "@/components/route-map";
import type { Location, Route, Vehicle } from "@/types/routing";

const routeColors = ["#4f46e5", "#0d9488", "#d97706", "#db2777", "#16a34a"];

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedDepotId, setSelectedDepotId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProblem() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/problem", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load address data.");
        const data: { locations: Location[]; vehicles: Vehicle[] } = await response.json();
        if (active) {
          setLocations(data.locations);
          setVehicles(data.vehicles);
          setRoutes([]);
          setSelectedDepotId(null);
          setSelectedVehicleId(null);
        }
      } catch (requestError) {
        console.error(requestError);
        if (active) setError("Unable to load the routing problem.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProblem();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  async function optimizeRoutes() {
    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch("/api/routes/optimize", { method: "POST" });
      if (!response.ok) throw new Error("Unable to optimize routes.");
      const data: { routes: Route[] } = await response.json();
      setRoutes(data.routes);
      setSelectedDepotId(null);
      setSelectedVehicleId(null);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to optimize routes.");
    } finally {
      setIsOptimizing(false);
    }
  }

  const totalDemand = locations.reduce((sum, location) => sum + location.demand, 0);
  const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
  const assignedStops = routes.reduce((sum, route) => sum + route.stops.length - 2, 0);
  const distributionCenters = locations.filter((location) => location.name.includes("Distribution Center"));
  const selectedDepotRoutes = selectedDepotId === null
    ? []
    : routes.filter((route) => route.depotId === selectedDepotId);

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">RO</div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Delivery Route Optimizer</p>
              <p className="text-xs text-slate-500">San Francisco routing lab</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700" onClick={() => setReloadToken((token) => token + 1)} type="button">Reset problem</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Optimization workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Turn stops into routes.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Optimize a real Bay Area delivery scenario using official address points from San Francisco, Oakland, and Berkeley.
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            disabled={isLoading || isOptimizing}
            onClick={optimizeRoutes}
            type="button"
          >
            {isOptimizing ? "Optimizing…" : "Optimize routes"}
          </button>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Delivery stops", String(Math.max(0, locations.length - 1)), "One depot excluded"],
            ["Vehicles", String(vehicles.length), "Capacity 100 each"],
            ["Assigned", routes.length ? `${assignedStops} / ${locations.length - 1}` : "—", "After optimization"],
            ["Total distance", routes.length ? `${totalDistance.toFixed(1)} km` : "—", "OSRM road distance"],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </div>
          ))}
        </section>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-[700px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-semibold">Route map</h2>
                <p className="mt-1 text-xs text-slate-500">Bay Area addresses · depot, stops, and generated road routes</p>
              </div>
              <span className="text-xs text-slate-400">Total demand: {totalDemand}</span>
            </div>
            <div className="min-h-0 flex-1">
              <RouteMap locations={locations} routes={routes} selectedVehicleId={selectedVehicleId} />
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold">Plan routes</h2>
              <p className="mt-1 text-xs text-slate-500">Select a distribution center, then choose a route</p>
            </div>

            <div className="border-b border-slate-100 p-3">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Distribution centers</p>
              <div className="space-y-1">
                {distributionCenters.map((center) => {
                  const centerRoutes = routes.filter((route) => route.depotId === center.id);
                  return (
                    <button
                      aria-pressed={selectedDepotId === center.id}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 ${selectedDepotId === center.id ? "bg-indigo-50 text-indigo-950" : ""}`}
                      key={center.id}
                      onClick={() => {
                        setSelectedDepotId(center.id);
                        setSelectedVehicleId(null);
                      }}
                      type="button"
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full bg-slate-900" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{center.name}</span>
                        <span className="mt-1 block truncate text-xs text-slate-500">{center.address}</span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">{centerRoutes.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {isLoading && <p className="p-5 text-sm text-slate-500">Loading addresses…</p>}
              {!isLoading && routes.length === 0 && <p className="p-5 text-sm text-slate-500">Click “Optimize routes” to assign the delivery stops.</p>}
              {!isLoading && routes.length > 0 && selectedDepotId === null && <p className="p-5 text-sm text-slate-500">Choose a distribution center to view its routes.</p>}
              {!isLoading && selectedDepotId !== null && selectedDepotRoutes.length === 0 && <p className="p-5 text-sm text-slate-500">No routes generated for this distribution center.</p>}
              {selectedDepotRoutes.map((route, index) => (
                <button
                  className={`block w-full p-5 text-left transition hover:bg-slate-50 ${selectedVehicleId === route.vehicleId ? "bg-indigo-50" : ""}`}
                  key={route.vehicleId}
                  onClick={() => setSelectedVehicleId(route.vehicleId)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: routeColors[index % routeColors.length] }} />
                    <span className="flex-1 text-sm font-medium">{route.vehicleName}</span>
                    <span className="text-xs text-slate-500">{route.load} load</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{route.stops.length - 2} stops · {route.distance.toFixed(1)} km · {route.durationMinutes} min</p>
                  <p className="mt-2 truncate font-mono text-[11px] text-slate-400">{route.stops.join(" → ")}</p>
                </button>
              ))}
            </div>
            <div className="m-5 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Road routing</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Select a center to filter its routes, then click a route to animate it on the street network.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
