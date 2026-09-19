"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import type { LinehaulDepot, LinehaulRoute } from "@/types/linehaul";

const routeColors = ["#4f46e5", "#0d9488", "#d97706", "#db2777", "#16a34a", "#0891b2"];

type LinehaulMapProps = {
  depots: LinehaulDepot[];
  routes: LinehaulRoute[];
  selectedRouteId: string | null;
};

export function LinehaulMap({ depots, routes, selectedRouteId }: LinehaulMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const animationMarker = useRef<Leaflet.CircleMarker | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;

    async function initializeMap() {
      const { default: L } = await import("leaflet");
      if (disposed || !mapContainer.current || map.current) return;

      const instance = L.map(mapContainer.current, {
        center: [39.5, -78.5],
        zoom: 5,
        minZoom: 3,
        maxZoom: 12,
      });
      map.current = instance;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, and other contributors",
          maxZoom: 19,
        },
      ).addTo(instance);

      const depotById = new Map(depots.map((depot) => [depot.id, depot]));
      for (const [index, route] of routes.entries()) {
        const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polyline(points, {
          color: routeColors[index % routeColors.length],
          weight: 4,
          opacity: 0.75,
        })
          .addTo(instance)
          .bindTooltip(`${route.originName} → ${route.destinationName}${route.relayNames?.length ? ` via ${route.relayNames.join(" → ")}` : ""}`);
      }

      for (const depot of depots) {
        const marker = L.circleMarker([depot.lat, depot.lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#0f172a",
          fillOpacity: 1,
          weight: 3,
        }).addTo(instance);
        marker.bindPopup(`<strong>${depot.name}</strong><br />${depot.address ?? ""}`);
      }

      if (depotById.size > 1) {
        instance.fitBounds(
          L.latLngBounds(depots.map((depot) => [depot.lat, depot.lng] as [number, number])),
          { padding: [30, 30] },
        );
      }
    }

    initializeMap();

    return () => {
      disposed = true;
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
      animationMarker.current?.remove();
      animationMarker.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, [depots, routes]);

  useEffect(() => {
    if (!selectedRouteId || !map.current) return;
    const selectedRoute = routes.find((candidate) => candidate.id === selectedRouteId);
    if (!selectedRoute) return;
    const route = selectedRoute;

    let cancelled = false;
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    animationMarker.current?.remove();

    async function animateRoute() {
      const { default: L } = await import("leaflet");
      if (cancelled || !map.current) return;

      const points = route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      if (points.length < 2) return;
      const marker = L.circleMarker(points[0], {
        radius: 9,
        color: "#ffffff",
        fillColor: "#ef4444",
        fillOpacity: 1,
        weight: 3,
      }).addTo(map.current);
      animationMarker.current = marker;
      map.current.fitBounds(L.latLngBounds(points), { padding: [40, 40], duration: 0.8 });

      const startedAt = performance.now();
      const duration = 5000;
      const animate = (timestamp: number) => {
        const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / duration));
        const index = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
        const point = points[index];
        if (point) marker.setLatLng(point);
        if (progress < 1 && !cancelled) animationFrame.current = window.requestAnimationFrame(animate);
      };
      animationFrame.current = window.requestAnimationFrame(animate);
    }

    animateRoute();
    return () => {
      cancelled = true;
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
      animationMarker.current?.remove();
      animationMarker.current = null;
    };
  }, [routes, selectedRouteId]);

  return <div ref={mapContainer} className="h-full min-h-[620px] w-full" />;
}
