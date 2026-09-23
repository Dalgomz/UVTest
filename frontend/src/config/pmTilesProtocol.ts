import { addProtocol } from 'maplibre-gl';
import { Protocol } from 'pmtiles';

// Load PMTiles once
let pmtilesRegistered: boolean = false;

export function registerPmtilesProtocol(): void {
  if (pmtilesRegistered) return;
  const protocol = new Protocol();
  addProtocol('pmtiles', protocol.tile);
  pmtilesRegistered = true;
}