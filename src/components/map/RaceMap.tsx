"use client";

import maplibregl, { type LngLatBoundsLike, type Map as MlMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import Supercluster from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Crosshair, Layers } from "lucide-react";
import { useTheme } from "next-themes";

interface MapRace {
  id: string;
  slug: string;
  name: string;
  country_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  primary_type: string;
  event_date: string | null;
}

const STYLE_LIGHT = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const STYLE_DARK = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function RaceMap({ onSelect }: { onSelect?: (race: MapRace) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const clusterRef = useRef<Supercluster | null>(null);
  const allRaces = useRef<Map<string, MapRace>>(new Map());
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: resolvedTheme === "dark" ? STYLE_DARK : STYLE_LIGHT,
      center: [10, 30],
      zoom: 1.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.FullscreenControl(), "bottom-right");

    map.on("load", () => {
      setLoading(false);
      clusterRef.current = new Supercluster({
        radius: 60,
        maxZoom: 12,
      });

      // empty source we'll populate after first fetch
      map.addSource("races", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: false,
      });

      map.addLayer({
        id: "race-clusters",
        type: "circle",
        source: "races",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#FF6B5B",
          "circle-opacity": 0.85,
          "circle-radius": ["step", ["get", "point_count"], 18, 25, 24, 100, 32, 500, 42],
          "circle-stroke-width": 3,
          "circle-stroke-color": resolvedTheme === "dark" ? "#16161d" : "#fff",
          "circle-stroke-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "race-cluster-count",
        type: "symbol",
        source: "races",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#fff",
        },
      });

      map.addLayer({
        id: "race-points",
        type: "circle",
        source: "races",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#FF6B5B",
          "circle-radius": 5,
          "circle-stroke-width": 2,
          "circle-stroke-color": resolvedTheme === "dark" ? "#16161d" : "#fff",
        },
      });

      const updateClusters = () => {
        if (!clusterRef.current || !map.getSource("races")) return;
        const bounds = map.getBounds();
        const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()] as [
          number,
          number,
          number,
          number,
        ];
        const zoom = Math.floor(map.getZoom());
        const clusters = clusterRef.current.getClusters(bbox, zoom);
        (map.getSource("races") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: clusters as GeoJSON.Feature[],
        });
      };

      const fetchBbox = async () => {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        try {
          const res = await fetch(`/api/races-bbox?bbox=${bbox}`);
          const json = await res.json();
          const races: MapRace[] = json.data ?? [];
          for (const r of races) {
            if (r.id) allRaces.current.set(r.id, r);
          }
          if (clusterRef.current) {
            clusterRef.current.load(
              [...allRaces.current.values()]
                .filter((r) => r.latitude !== null && r.longitude !== null)
                .map((r) => ({
                  type: "Feature" as const,
                  geometry: {
                    type: "Point" as const,
                    coordinates: [r.longitude!, r.latitude!],
                  },
                  properties: r,
                })),
            );
            updateClusters();
          }
        } catch {
          /* ignore */
        }
      };

      let fetchTimer: number | null = null;
      const debouncedFetch = () => {
        if (fetchTimer) window.clearTimeout(fetchTimer);
        fetchTimer = window.setTimeout(fetchBbox, 250);
      };

      map.on("moveend", () => {
        updateClusters();
        debouncedFetch();
      });
      map.on("zoomend", updateClusters);

      map.on("click", "race-clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["race-clusters"],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId === undefined || !clusterRef.current) return;
        const expansion = clusterRef.current.getClusterExpansionZoom(clusterId);
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom: expansion + 0.5 });
      });

      map.on("click", "race-points", (e) => {
        const props = e.features?.[0]?.properties as unknown as MapRace;
        if (props && onSelect) onSelect(props);
      });

      ["race-clusters", "race-points"].forEach((layer) => {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });

      fetchBbox();
    });

    return () => {
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      allRaces.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  function locateMe() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 8,
        duration: 1200,
      });
    });
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/40 backdrop-blur-sm">
          <span className="rounded-full bg-surface px-3 py-1 text-xs text-fg-muted">
            지도 로딩 중...
          </span>
        </div>
      )}
      <div className="absolute left-3 top-3 flex flex-col gap-2">
        <Button size="icon" variant="glass" onClick={locateMe} aria-label="내 위치">
          <Crosshair className="size-4" />
        </Button>
        <Button size="icon" variant="glass" aria-label="레이어">
          <Layers className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export type { MapRace };
