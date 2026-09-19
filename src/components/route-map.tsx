"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import type { Location, Route } from "@/types/routing";

const routeColors = ["#4f46e5", "#0d9488", "#d97706", "#db2777", "#16a34a"];

type RouteMapProps = {
  locations: Location[];
  routes: Route[];
  selectedVehicleId: number | null;
};

export function RouteMap({ locations, routes, selectedVehicleId }: RouteMapProps) {
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

        const roadPoints = route.geometry?.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        const routePoints = roadPoints?.length ? roadPoints : points;

        if (routePoints.length > 1) {
          L.polyline(routePoints, {
            color: routeColors[index % routeColors.length],
            weight: 4,
            opacity: 0.8,
          })
            .addTo(instance)
            .bindTooltip(`${route.vehicleName} · ${route.load} demand · ${route.durationMinutes} min`);
        }
      }

      for (const location of locations) {
        const isDepot = location.name.includes("Distribution Center");
        L.circleMarker([location.lat, location.lng], {
          radius: isDepot ? 9 : 5,
          color: "#ffffff",
          fillColor: isDepot ? "#0f172a" : "#64748b",
          fillOpacity: 1,
          weight: 2,
        })
          .addTo(instance)
          .bindPopup(`<strong>${location.name}</strong><br />${location.address ?? "No address"}<br />Demand: ${location.demand}`);
      }

      if (locations.length > 1) {
        instance.fitBounds(
          L.latLngBounds(locations.map((location) => [location.lat, location.lng] as [number, number])),
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
  }, [locations, routes]);

  useEffect(() => {
    if (!selectedVehicleId || !map.current) return;

    const route = routes.find((candidate) => candidate.vehicleId === selectedVehicleId);
    if (!route) return;

    const byId = new Map(locations.map((location) => [location.id, location]));
    const geometryPoints = route.geometry?.coordinates
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
      .map(([lng, lat]) => [lat, lng] as [number, number]);
    const stopPoints = route.stops
      .map((id) => byId.get(id))
      .filter((location): location is Location => Boolean(location))
      .map((location) => [location.lat, location.lng] as [number, number]);
    const points = geometryPoints && geometryPoints.length > 1 ? geometryPoints : stopPoints;

    if (points.length < 2) return;

    let cancelled = false;
    if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current);
    animationMarker.current?.remove();

    async function animateRoute() {
      const { default: L } = await import("leaflet");
      if (cancelled || !map.current) return;

      const color = routeColors[routes.findIndex((candidate) => candidate.vehicleId === selectedVehicleId) % routeColors.length];
      const marker = L.circleMarker(points[0], {
        radius: 9,
        color: "#ffffff",
        fillColor: color,
        fillOpacity: 1,
        weight: 3,
      }).addTo(map.current);
      animationMarker.current = marker;
      map.current.fitBounds(L.latLngBounds(points), { padding: [40, 40], duration: 0.8 });

      const startedAt = performance.now();
      const duration = 6000;
      const animate = (timestamp: number) => {
        const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / duration));
        const pointIndex = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
        const point = points[pointIndex];
        if (!point || !Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
        marker.setLatLng(point);
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
  }, [locations, routes, selectedVehicleId]);

  return <div ref={mapContainer} className="h-full min-h-[620px] w-full" />;
}
