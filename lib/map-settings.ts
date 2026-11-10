import type { Road } from './game';

export type MapSettings = {
  positions: Record<string, { x: number; y: number }>;
  roads: Record<string, Road>;
};

export const defaultMapSettings: MapSettings = { positions: {}, roads: {} };
