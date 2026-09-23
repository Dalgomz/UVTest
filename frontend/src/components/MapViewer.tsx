import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapObject, NavigationControl, Marker, Popup } from 'maplibre-gl';
import type { StyleSpecification, LngLat, MapMouseEvent, GeoJSONSource } from 'maplibre-gl';
import type { Feature, FeatureCollection, LineString, Polygon, Point } from 'geojson';

import { registerPmtilesProtocol } from '@/config/pmTilesProtocol';
import { OSM_RASTER_STYLE } from '@/config/mapStyleConf';

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

// The path being drawn: a LineString while open, a closed Polygon once finished.
function drawGeoSelectionArea(points: Coords[], closed: boolean): Feature<LineString | Polygon> {
  if (closed && points.length >= 3) {
    return {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [[...points, points[0]]] },
    };
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: points },
  };
}

// One point feature per vertex, flagged so the first one can be styled
// differently (it's what you click to close the shape).
function drawGeoVertices(points: Coords[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p, i) => ({
      type: 'Feature',
      properties: { isFirst: i === 0 },
      geometry: { type: 'Point', coordinates: p },
    })),
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
  onMapClick?: (lngLat: LngLat) => void;
  className?: string;
  enableDrawing: boolean;
  selectionCallback?: (selectionArea: Coords[]) => void;
  stopDrawModeCallback?: () => void;
};


export default function MapViewer({
  center = [0, 20],
  zoom = 2,
  bounds,            // [west, south, east, north] — overrides center/zoom, fits the map to this bbox
  staticMap = false, // true = no pan/zoom/rotate, no controls (good for a fixed-bbox render)
  lockToBounds = false, // true = stay interactive, but pan/zoom-out is clamped
  boundsPadding = 0, // e.g. 0.2 = let the user pan 20% of the bbox size beyond it, dimmed
  styleSpec = OSM_RASTER_STYLE, // pass a URL string to use a hosted vector style instead
  onMapClick = () => {},         // (lngLat: {lng, lat}) => void
  className = '',
  enableDrawing = false,
  selectionCallback = ()=>{},
  stopDrawModeCallback = ()=>{},
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapObject | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  
  const [drawPoints, setDrawPoints] = useState<Coords[]>([]);
  const [isDrawClosed, setIsDrawClosed] = useState(false);

  const drawPointsRef = useRef<Coords[]>(drawPoints);
  const isDrawClosedRef = useRef(isDrawClosed);
  const enableDrawingRef = useRef(enableDrawing);
  useEffect(() => { drawPointsRef.current = drawPoints; }, [drawPoints]);
  useEffect(() => { isDrawClosedRef.current = isDrawClosed; }, [isDrawClosed]);
  useEffect(() => { enableDrawingRef.current = enableDrawing; }, [enableDrawing]);
  
  // Turning drawing on (including re-enabling it) starts a fresh shape.
  useEffect(() => {
    if (enableDrawing) {
      setDrawPoints([]);
      setIsDrawClosed(false);
      return;
    }
    if (isDrawClosedRef.current) return; // already finalized via click-to-close
    if (drawPointsRef.current.length >= 3) {
      setIsDrawClosed(true);
      selectionCallback(drawPointsRef.current);
    } else {
      setDrawPoints([]);
    }
  }, [enableDrawing]);

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
        map.addSource('boundary-mask', { type: 'geojson', data: buildExternalMapMask(bounds) });
        map.addLayer({
          id: 'bounds-mask-layer',
          type: 'fill',
          source: 'boundary-mask',
          paint: { 'fill-color': '#0F1417', 'fill-opacity': 0.6 },
        });
      };
      if (map.isStyleLoaded()) addMask();
      else map.once('load', addMask);
    }
    
    const addDrawLayers = () => {
      map.addSource('draw-shape', { type: 'geojson', data: drawGeoSelectionArea([], false) });
      map.addLayer({
        id: 'draw-fill',
        type: 'fill',
        source: 'draw-shape',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: { 'fill-color': '#ce710d', 'fill-opacity': 0.35 },
      });
      map.addLayer({
        id: 'draw-line',
        type: 'line',
        source: 'draw-shape',
        paint: { 'line-color': '#ce710d', 'line-width': 2, 'line-dasharray': [2, 2] },
      });

      map.addSource('draw-vertices', { type: 'geojson', data: drawGeoVertices([]) });
      map.addLayer({
        id: 'draw-vertices-layer',
        type: 'circle',
        source: 'draw-vertices',
        paint: {
          'circle-radius': ['case', ['get', 'isFirst'], 8, 5],
          'circle-color': '#ce710d',
          'circle-stroke-color': '#0F1417',
          'circle-stroke-width': 1.5,
        },
      });
    };
    if (map.isStyleLoaded()) addDrawLayers();
    else map.once('load', addDrawLayers);

    const handleClick = (e: MapMouseEvent) => {
      if (!enableDrawingRef.current) {
        onMapClick(e.lngLat);
        return;
      }
      if (isDrawClosedRef.current) return;

      const currentPoints = drawPointsRef.current;
      // Clicking back near the first vertex closes the shape.
      if (currentPoints.length >= 3) {
        const firstPixel = map.project(currentPoints[0]);
        const dist = Math.hypot(e.point.x - firstPixel.x, e.point.y - firstPixel.y);
        if (dist < 12) {
          setIsDrawClosed(true);
          selectionCallback(currentPoints);
          stopDrawModeCallback();
          return;
        }
      }

      const newPoint: Coords = [e.lngLat.lng, e.lngLat.lat];
      setDrawPoints((prev) => [...prev, newPoint]);
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

  // Push the current draw points into the map sources whenever they change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
 
    const updateDrawSources = () => {
      const shapeSource = map.getSource('draw-shape') as GeoJSONSource | undefined;
      shapeSource?.setData(drawGeoSelectionArea(drawPoints, isDrawClosed));
 
      const vertexSource = map.getSource('draw-vertices') as GeoJSONSource | undefined;
      vertexSource?.setData(drawGeoVertices(drawPoints));
    };
 
    if (map.isStyleLoaded()) updateDrawSources();
    else map.once('load', updateDrawSources);
  }, [drawPoints, isDrawClosed]);
 
  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
}
