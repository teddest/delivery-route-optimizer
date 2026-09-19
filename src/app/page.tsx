"use client";

import { useEffect, useState } from "react";
import { LinehaulMap } from "@/components/linehaul-map";
import type { LinehaulDepot, LinehaulRoute, LinehaulVehicle, Shipment } from "@/types/linehaul";

export default function Home() {
  const [depots, setDepots] = useState<LinehaulDepot[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<LinehaulVehicle[]>([]);
  const [routes, setRoutes] = useState<LinehaulRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
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
        const response = await fetch("/api/linehaul/problem", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load the linehaul network.");
        const data: { depots: LinehaulDepot[]; shipments: Shipment[]; vehicles: LinehaulVehicle[] } = await response.json();
        if (active) {
          setDepots(data.depots);
          setShipments(data.shipments);
          setVehicles(data.vehicles);
          setRoutes([]);
          setSelectedRouteId(null);
        }
      } catch (requestError) {
        console.error(requestError);
        if (active) setError("Unable to load the linehaul network.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProblem();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  async function optimizeLinehaul() {
    setIsOptimizing(true);
    setError(null);
    try {
      const response = await fetch("/api/linehaul/optimize", { method: "POST" });
      if (!response.ok) throw new Error("Unable to optimize linehaul routes.");
      const data: { routes: LinehaulRoute[] } = await response.json();
      setRoutes(data.routes);
      setSelectedRouteId(data.routes[0]?.id ?? null);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to optimize linehaul routes.");
    } finally {
      setIsOptimizing(false);
    }
  }

  const depotById = new Map(depots.map((depot) => [depot.id, depot]));
  const totalPallets = shipments.reduce((sum, shipment) => sum + shipment.pallets, 0);
  const totalDistance = routes.reduce((sum, route) => sum + route.distanceKm, 0);

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">LH</div>
            <div>
              <p className="text-sm font-semibold tracking-tight">East Region LTL Network</p>
              <p className="text-xs text-slate-500">Linehaul planning workspace</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700" onClick={() => setReloadToken((token) => token + 1)} type="button">Reset network</button>
        </div>
      </header>

      <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">LTL linehaul control</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Move freight between hubs.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Consolidate shipments between distribution centers and optimize direct linehaul legs on the road network.
            </p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            disabled={isLoading || isOptimizing}
            onClick={optimizeLinehaul}
            type="button"
          >
            {isOptimizing ? "Planning linehaul…" : "Optimize linehaul"}
          </button>
        </div>

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Distribution centers", String(depots.length), "Network hubs"],
            ["Shipments", String(shipments.length), "Ready for planning"],
            ["Pallets", String(totalPallets), "Demand to move"],
            ["Linehaul vehicles", String(vehicles.length), "26-pallet capacity"],
            ["Planned distance", routes.length ? `${totalDistance.toFixed(0)} km` : "—", "OSRM road distance"],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{detail}</p>
            </div>
          ))}
        </section>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-h-[calc(100vh-260px)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="font-semibold">Linehaul network map</h2>
                <p className="mt-1 text-xs text-slate-500">Distribution centers, direct freight lanes, and selected route animation</p>
              </div>
              <span className="text-xs text-slate-400">{routes.length} planned routes</span>
            </div>
            <div className="min-h-0 flex-1">
              <LinehaulMap depots={depots} routes={routes} selectedRouteId={selectedRouteId} />
            </div>
          </div>

          <aside className="max-h-[calc(100vh-260px)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold">Freight movements</h2>
              <p className="mt-1 text-xs text-slate-500">Origin → destination shipment lanes</p>
            </div>
            <div className="divide-y divide-slate-100">
              {isLoading && <p className="p-5 text-sm text-slate-500">Loading shipments…</p>}
              {!isLoading && shipments.map((shipment) => {
                const route = routes.find((candidate) => candidate.shipmentIds.includes(shipment.id));
                const origin = depotById.get(shipment.originDepotId);
                const destination = depotById.get(shipment.destinationDepotId);
                return (
                  <button
                    className={`block w-full p-4 text-left transition hover:bg-slate-50 ${route?.id === selectedRouteId ? "bg-indigo-50" : ""}`}
                    key={shipment.id}
                    onClick={() => route && setSelectedRouteId(route.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-xs font-semibold text-slate-700">{shipment.reference}</span>
                      <span className="text-xs text-slate-500">{shipment.pallets} pallets</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{origin?.name.replace(" Distribution Center", "")} → {destination?.name.replace(" Distribution Center", "")}</p>
                    <p className="mt-1 text-xs text-slate-500">{shipment.weightLbs.toLocaleString()} lbs · deadline {shipment.deliveryDeadlineHours}h</p>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-100 p-5">
              <h3 className="text-xs font-semibold text-slate-700">Planned linehaul routes</h3>
              <div className="mt-3 space-y-2">
                {routes.map((route) => (
                  <button
                    className={`block w-full rounded-lg border p-3 text-left transition hover:border-indigo-300 ${selectedRouteId === route.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200"}`}
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    type="button"
                  >
                    <p className="text-xs font-semibold">{route.originName.replace(" Distribution Center", "")} → {route.destinationName.replace(" Distribution Center", "")}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{route.vehicleName} · {route.pallets} pallets · {route.distanceKm} km · {route.durationMinutes} min</p>
                    <p className="mt-1 truncate text-[11px] text-indigo-600">{route.relayNames?.length ? `via ${route.relayNames.join(" → ")}` : "Direct lane"}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
