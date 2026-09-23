import { useEffect, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapObject, NavigationControl, Marker, Popup } from 'maplibre-gl';
import type { StyleSpecification, LngLat, MapMouseEvent } from 'maplibre-gl';
import type { Feature, Polygon } from 'geojson';

import { registerPmtilesProtocol } from '@/config/pmTilesProtocol';
import { OSM_RASTER_STYLE } from '@/config/mapStyleConf';

/**
 * MapView
 * Renders a MapLibre GL map inside a React component.
 *
 * Usage:
 *   <MapView center={[-73.99, 40.73]} zoom={11} />
 *
 * Notes:
 * - Defaults to real OpenStreetMap raster tiles (no API key needed). This is
 *   fine for development but has usage limits — for production, swap
 *   `styleSpec` for a vector style from MapTiler, Stadia Maps, or your own
 *   tile server, each of which needs a free/paid API key.
 * - The map instance is created once on mount and destroyed on unmount.
 *   center/zoom changes after mount call flyTo instead of re-creating the map.
 */

// Builds a world-covering polygon with a rectangular hole cut out for `bounds`,
// so a semi-transparent fill layer using this feature dims everywhere except
// the permitted bbox.
function buildExternalMapMask(boundsArr: Bbox): Feature<Polygon> {
  const [w, s, e, n] = boundsArr;
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        // outer ring, CCW, covers the whole world
        [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
        // inner ring (hole), CW, the permitted bbox
        [[w, s], [w, n], [e, n], [e, s], [w, s]],
      ],
    },
  };
}

type MapViewerProps = {
  center?: Coords;
  zoom?: number;
  bounds?: Bbox;         //  — overrides center/zoom, fits the map to this bbox
  staticMap?: boolean; // true = no pan/zoom/rotate, no controls (good for a fixed-bbox render)
  lockToBounds?: boolean, // true = stay interactive, but pan/zoom-out is clamped
  boundsPadding?: number, // e.g. 0.2 = let the user pan 20% of the bbox size beyond it, dimmed
  styleSpec?: StyleSpecification; // pass a URL string to use a hosted vector style instead
  markers?: MapMarker[];     // [{ lngLat: [lng, lat], label?: string, color?: string }]
  onMapClick?: (lngLat: LngLat) => void;
  className?: string;
  selectionCallback: (selectionArea: Coords[]) => void;
};


export default function MapViewer({
  center = [0, 20],
  zoom = 2,
  bounds,            // [west, south, east, north] — overrides center/zoom, fits the map to this bbox
  staticMap = false, // true = no pan/zoom/rotate, no controls (good for a fixed-bbox render)
  lockToBounds = false, // true = stay interactive, but pan/zoom-out is clamped
  boundsPadding = 0, // e.g. 0.2 = let the user pan 20% of the bbox size beyond it, dimmed
  styleSpec = OSM_RASTER_STYLE, // pass a URL string to use a hosted vector style instead
  markers = [],       // [{ lngLat: [lng, lat], label?: string, color?: string }]
  onMapClick,         // (lngLat: {lng, lat}) => void
  className = '',
  selectionCallback = ()=>{},
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapObject | null>(null);
  const markerRefs = useRef<Marker[]>([]);

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;
    registerPmtilesProtocol();

    const paddedBounds = bounds && boundsPadding
      ? (() => {
          const [w, s, e, n] = bounds;
          const padX = (e - w) * boundsPadding;
          const padY = (n - s) * boundsPadding;
          return [w - padX, s - padY, e + padX, n + padY];
        })()
      : bounds;

    const map = new MapObject({
      container: containerRef.current,
      style: styleSpec,
      center,
      zoom,
      interactive: !staticMap,
      attributionControl: false,
      ...(lockToBounds && paddedBounds
        ? { maxBounds: [[paddedBounds[0], paddedBounds[1]], [paddedBounds[2], paddedBounds[3]]] }
        : {}),
    });

    if (!staticMap) {
      map.addControl(new NavigationControl(), 'top-left');
    }

    if (bounds) {
      map.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: 0, animate: false }
      );
    }

    if (lockToBounds && bounds) {
      const addMask = () => {
        map.addSource('bounds-mask', { type: 'geojson', data: buildExternalMapMask(bounds) });
        map.addLayer({
          id: 'bounds-mask-layer',
          type: 'fill',
          source: 'bounds-mask',
          paint: { 'fill-color': '#0F1417', 'fill-opacity': 0.6 },
        });
      };
      if (map.isStyleLoaded()) addMask();
      else map.once('load', addMask);
    }

    const handleClick = (e: MapMouseEvent) => {
      onMapClick?.(e.lngLat);
    };
    map.on('click', handleClick);

    mapRef.current = map;

    return () => {
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
    };
    // Intentionally empty deps: style/center/zoom on first mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new center/zoom when props change (without recreating the map).
  // Skipped when `bounds` is set — bounds owns the view in that case.
  useEffect(() => {
    if (bounds) return;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, zoom });
  }, [center, zoom, bounds]);

  // Keep markers in sync with the `markers` prop.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers.
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = [];

    markers.forEach(({ longLat, label, color = '#E8A63D' }) => {
      const marker = new Marker({ color })
        .setLngLat(longLat)
        .addTo(map);
      if (label) {
        marker.setPopup(new Popup({ offset: 12 }).setText(label));
      }
      markerRefs.current.push(marker);
    });

    return () => {
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
    };
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
}
