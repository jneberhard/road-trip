import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { mapSettings as mapSettingsTable } from '../../../db/schema';
import { defaultMapSettings, type MapSettings } from '../../../lib/map-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [row] = await getDb().select().from(mapSettingsTable).where(eq(mapSettingsTable.id, 'global')).limit(1);
    const stored = row?.settings as MapSettings | undefined;
    return Response.json({ settings: stored ? { ...defaultMapSettings, ...stored, labelPositions: stored.labelPositions ?? {} } : defaultMapSettings, updated: row?.updated ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unable to read the shared map.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
