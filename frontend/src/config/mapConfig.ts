

function parseBbox(raw: string): Bbox {
  const bbox = raw.split(',').map(Number);
  if (bbox.length !== 4 || bbox.some(Number.isNaN)) {
    throw new Error(`Invalid VITE_MAP_BOUNDS`);
  }
  return bbox as Bbox;
}

function parseDecimal(raw: string): number {
  const value = Number(raw);
  if (Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid VITE_MAP_PADDING: "${raw}" — expected a non-negative number`);
  }
  return value;
}

const envBounds = import.meta.env.VITE_MAP_BOUNDS;
const envPadding = import.meta.env.VITE_MAP_PADDING;

export const MAP_BBOX: Bbox = parseBbox(envBounds);
export const MAP_PADDING: number = parseDecimal(envPadding);