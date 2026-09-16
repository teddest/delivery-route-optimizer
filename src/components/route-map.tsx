"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import type { Location, Route } from "@/types/routing";

const routeColors = ["#4f46e5", "#0d9488", "#d97706", "#db2777", "#16a34a"];

export function RouteMap({ locations, routes }: { locations: Location[]; routes: Route[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);

  useEffect(() => {
    let disposed = false;

    async function initializeMap() {
      const { default: L } = await import("leaflet");
      if (disposed || !mapContainer.current || map.current) return;

      const instance = L.map(mapContainer.current, {
        center: [37.7749, -122.4194],
        zoom: 10.5,
        minZoom: 2,
        maxZoom: 19,
      });
      map.current = instance;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, and other contributors",
          maxZoom: 19,
        },
      ).addTo(instance);

      const byId = new Map(locations.map((location) => [location.id, location]));

      for (const [index, route] of routes.entries()) {
        const points = route.stops
          .map((id) => byId.get(id))
          .filter((location): location is Location => Boolean(location))
          .map((location) => [location.lat, location.lng] as [number, number]);

        if (points.length > 1) {
          L.polyline(points, {
            color: routeColors[index % routeColors.length],
            weight: 4,
            opacity: 0.8,
          })
            .addTo(instance)
            .bindTooltip(`${route.vehicleName} · ${route.load} demand`);
        }
      }

      for (const location of locations) {
        L.circleMarker([location.lat, location.lng], {
          radius: location.id === 1 ? 9 : 5,
          color: "#ffffff",
          fillColor: location.id === 1 ? "#0f172a" : "#64748b",
          fillOpacity: 1,
          weight: 2,
        })
          .addTo(instance)
          .bindPopup(`<strong>${location.name}</strong><br />Demand: ${location.demand}`);
      }
    }

    initializeMap();

    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
  }, [locations, routes]);

  return <div ref={mapContainer} className="h-full min-h-[620px] w-full" />;
}
