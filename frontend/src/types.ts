type Kpi = {
  key: string;
  label: string;
  value: number;
  unit: string;
  band: string;
  definition: string;
}

type MapMarker = {
  longLat: Coords; 
  label?: string; 
  color?: string
};

/**
 * Coords numeric pair with shape: longitude, latitude
 */ 
type Coords = [ number, number ];

/**
 * Bbox coords sorted in shape: west, south, east, north
 */ 
type Bbox = [number, number, number, number];

type RArea = {
  name: string;
  km2: number;
};
type LegendItem = {
  label: string;
  color: string;
};
type RLegend = {
  type: string;
  items: LegendItem[];
};
type RLayers = {
  vectors: unknown[];
};
type ResponseKPI = {
  area: RArea;
  kpis: Kpi[];
  insights: string[];
  legend?: RLegend;
  layers?: RLayers;
};