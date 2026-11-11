import type { Road } from './game';
import savedMapSettings from './map-settings.json';

export type MapSettings = {
  positions: Record<string, { x: number; y: number }>;
  roads: Record<string, Road>;
  labelPositions: Record<string, { x: number; y: number }>;
};

export const defaultMapSettings: MapSettings = {
  positions: savedMapSettings.positions,
  roads: savedMapSettings.roads,
  labelPositions: savedMapSettings.labelPositions ?? {},
};
