import { eq } from 'drizzle-orm';
import { getDb } from '../../../../db';
import { mapSettings as mapSettingsTable } from '../../../../db/schema';
import { routeShapes, spaces, type Road } from '../../../../lib/game';
import type { MapSettings } from '../../../../lib/map-settings';

export const dynamic = 'force-dynamic';
const roadTypes: Road[] = ['Freeway', 'Highway', 'State road', 'County road'];
const allowedRoads = new Set(routeShapes.map(route => `${route.a}|${route.b}`));
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

function validSettings(value: unknown): value is MapSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Partial<MapSettings>;
  if (!settings.positions || typeof settings.positions !== 'object' || !settings.roads || typeof settings.roads !== 'object') return false;
  const positionEntries = Object.entries(settings.positions);
  if (positionEntries.length > Object.keys(spaces).length) return false;
  for (const [id, point] of positionEntries) {
    if (!spaces[id] || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 920 || point.y < 0 || point.y > 1110) return false;
  }
  for (const [key, road] of Object.entries(settings.roads)) if (!allowedRoads.has(key) || !roadTypes.includes(road)) return false;
  return true;
}

export async function POST(request: Request) {
  const secret = process.env.MAP_ADMIN_PASSWORD;
  if (!secret) return json({ error: 'Map admin is not configured. Add MAP_ADMIN_PASSWORD in Vercel Environment Variables.' }, 503);
  let body: { password?: unknown; action?: unknown; settings?: unknown };
  try { body = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }
  if (typeof body.password !== 'string' || body.password.length !== secret.length || body.password !== secret) return json({ error: 'Incorrect admin password.' }, 403);
  if (body.action === 'authenticate') return json({ ok: true });
  if (!validSettings(body.settings)) return json({ error: 'Map changes contain an invalid road or location.' }, 400);
  try {
    const db = getDb();
    const [row] = await db.insert(mapSettingsTable).values({ id: 'global', settings: body.settings, updated: new Date() })
      .onConflictDoUpdate({ target: mapSettingsTable.id, set: { settings: body.settings, updated: new Date() } })
      .returning({ updated: mapSettingsTable.updated });
    return json({ ok: true, settings: body.settings, updated: row.updated });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unable to save the shared map.' }, 503);
  }
}
