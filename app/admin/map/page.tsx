'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, Check, LockKeyhole, RotateCcw, Save } from 'lucide-react';
import { bookCliffsShape, destinationHubs, destinations, homeBases, hubs, islandShapes, lakePowellShapes, mappedLakes, mountainShapes, projectRoadPoint, riverLabels, riverShapes, roadMapSegments, saltFlatsShape, sevierLakeShape, spaces, stateBoundaryShapes, stateLabels, type Road } from '../../../lib/game';
import { hiddenTerrainLabels, destinationColor, destinationHubIds, destinationMarkerPositions, hiddenBlackDots, hiddenHubDots, numberedBlackDots, placedMapLabels, roadColors } from '../../../lib/map-display';
import { defaultMapSettings, type MapSettings } from '../../../lib/map-settings';

const roads: Road[] = ['Freeway', 'Highway', 'State road', 'County road'];
const routeKey = (a: string, b: string) => `${a}|${b}`;
const mapPosition = (settings: MapSettings, id: string) => settings.positions[id] ?? (id === 'yuba-i15-exit' ? destinationMarkerPositions.get(id) : undefined) ?? spaces[id];

export default function MapAdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<MapSettings>(defaultMapSettings);
  const [roadType, setRoadType] = useState<Road>('Freeway');
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [mapPanning, setMapPanning] = useState(false);
  const dragRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ id: number; x: number; y: number; left: number; top: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (!authenticated) return;
    fetch('/api/map').then(async response => {
      const data = await response.json() as { settings?: MapSettings; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not load the shared map.');
      setSettings({ ...defaultMapSettings, ...(data.settings ?? {}), labelPositions: data.settings?.labelPositions ?? {} });
    }).catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load the shared map.'));
  }, [authenticated]);

  async function authenticate(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/map', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'authenticate', password }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      setAuthenticated(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not sign in.'); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setError(''); setSaved(false);
    try {
      const response = await fetch('/api/admin/map', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, settings }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not save the map.');
      setSaved(true); window.setTimeout(() => setSaved(false), 3500);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save the map.'); }
    finally { setBusy(false); }
  }

  function pointFromEvent(event: ReactPointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(920, (event.clientX - box.left) * 920 / box.width)), y: Math.max(0, Math.min(1110, (event.clientY - box.top) * 1110 / box.height)) };
  }
  function onMapPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (dragRef.current) {
      const point = pointFromEvent(event), id = dragRef.current;
      if (id.startsWith('label|')) {
        const labelId = id.slice(6);
        setSettings(previous => ({ ...previous, labelPositions: { ...previous.labelPositions, [labelId]: point } }));
      } else setSettings(previous => ({ ...previous, positions: { ...previous.positions, [id]: point } }));
    }
  }
  function panStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= 1 || event.button !== 0) return;
    panRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop, moved: false };
  }
  function panMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pan = panRef.current; if (!pan || pan.id !== event.pointerId) return;
    const dx = event.clientX - pan.x, dy = event.clientY - pan.y;
    if (Math.abs(dx) + Math.abs(dy) > 4 && !pan.moved) { pan.moved = true; setMapPanning(true); event.currentTarget.setPointerCapture(event.pointerId); }
    if (pan.moved) { event.currentTarget.scrollLeft = pan.left - dx; event.currentTarget.scrollTop = pan.top - dy; }
  }
  function panEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panRef.current || panRef.current.id !== event.pointerId) return;
    panRef.current = null; setMapPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (!authenticated) return <main className="admin-login"><form onSubmit={authenticate}><div className="admin-mark"><LockKeyhole size={24}/></div><p className="eyebrow">TOUR OF UTAH · ADMINISTRATION</p><h1>Map editor</h1><p>Sign in to edit the map used by every game.</p><label>Admin password<input type="password" value={password} autoFocus onChange={event => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <p className="admin-error">{error}</p>}<button className="primary" disabled={busy || !password}>{busy ? 'Checking…' : 'Open map editor'} <LockKeyhole size={16}/></button><a href="/">Return to game</a></form></main>;

  return <main className="map-admin">
    <header className="admin-header"><a href="/" className="admin-back"><ArrowLeft size={17}/> Game</a><div><p className="eyebrow">TOUR OF UTAH · ADMINISTRATION</p><h1>Map editor</h1></div><button className="primary admin-save" onClick={save} disabled={busy}>{saved ? <><Check size={16}/> Saved to shared map</> : <><Save size={16}/> Save for deployed game</>}</button></header>
    <section className="admin-layout"><aside className="admin-controls"><h2>Edit the road map</h2><p>Drag a dot to move a location, or drag a city or destination name to move its label. Choose a road type, then click a dot-to-dot road segment to recolor only that segment. Save publishes your changes for everyone playing.</p><label>Road color to apply<select value={roadType} onChange={event => setRoadType(event.target.value as Road)}>{roads.map(road => <option key={road} value={road}>{road}</option>)}</select></label><div className="admin-road-legend">{roads.map(road => <div key={road}><i style={{ background: roadColors[road] }}/>{road}</div>)}</div><div className="admin-hint"><strong>Move a location or label</strong><span>Drag a dot to move it. Drag the city or destination name to position its label independently.</span></div><div className="admin-hint"><strong>Change road type</strong><span>Select the type above, then click any road segment between dots.</span></div><button className="outline full" onClick={() => setSettings(defaultMapSettings)}><RotateCcw size={15}/> Reset unsaved edits</button>{error && <p className="admin-error">{error}</p>}{saved && <p className="admin-success">Map saved. The game board refreshes the shared map automatically.</p>}</aside>
      <div className="admin-board"><div className="admin-map-tools"><button onClick={() => setZoom(Math.min(3, zoom + .25))}>+</button><button onClick={() => setZoom(Math.max(.75, zoom - .25))}>−</button><button aria-label="Reset map view" onClick={() => { setZoom(1); if (scrollRef.current) { scrollRef.current.scrollLeft = 0; scrollRef.current.scrollTop = 0; } }}><RotateCcw size={14}/></button></div>
        <div ref={scrollRef} className={`map-scroll admin-map-scroll${mapPanning ? ' is-dragging' : ''}`} onPointerDown={panStart} onPointerMove={panMove} onPointerUp={panEnd} onPointerCancel={panEnd} style={{ touchAction: zoom > 1 ? 'none' : 'pan-x pan-y', cursor: zoom > 1 ? (mapPanning ? 'grabbing' : 'grab') : undefined }}>
          <svg viewBox="0 0 920 1110" style={{ width: `${zoom * 100}%`, maxWidth: 'none' }} onPointerMove={onMapPointerMove} onPointerUp={() => { dragRef.current = null; setDragging(null); }} onPointerCancel={() => { dragRef.current = null; setDragging(null); }}>
            <rect width="920" height="1110" fill="#f3f2e9"/>
            {mappedLakes.map(lake => lake.rings.map((ring, index) => <polygon key={`${lake.name}-${index}`} points={ring.map(point => `${point.x},${point.y}`).join(' ')} fill="#b9dbe0" stroke="#83b7c0" strokeWidth="1.4" opacity=".9"/>))}
            <polygon points={bookCliffsShape.points.map(point => `${point.x},${point.y}`).join(' ')} fill="#d9d1b6" stroke="#b9ad8d" strokeWidth="1.5" opacity=".53"/>
            {mountainShapes.map(shape => <g key={shape.name}><path d={`M${shape.label.x-30} ${shape.label.y+11} L${shape.label.x-20} ${shape.label.y-4} L${shape.label.x-10} ${shape.label.y+7} L${shape.label.x} ${shape.label.y-12} L${shape.label.x+10} ${shape.label.y+7} L${shape.label.x+20} ${shape.label.y-4} L${shape.label.x+30} ${shape.label.y+11} M${shape.label.x-34} ${shape.label.y+11} H${shape.label.x+34}`} fill="#d9e0d5" stroke="#879486" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>{!hiddenTerrainLabels.has(shape.name)&&<text x={shape.label.x} y={shape.label.y+28} textAnchor="middle" className="geography terrain-label">{shape.name.toUpperCase()}</text>}</g>)}
            <polygon points={saltFlatsShape.map(point => `${point.x},${point.y}`).join(' ')} fill="#dfe0e1" stroke="#cfd1d3" strokeWidth="1.2"/>
            <polygon points={sevierLakeShape.map(point => `${point.x},${point.y}`).join(' ')} fill="#b9dbe0" stroke="#83b7c0" strokeWidth="1.3" opacity=".8"/>
            {riverShapes.map(river => <polyline key={river.name} points={river.points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#4f9baa" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" opacity=".88"/>)}{lakePowellShapes.map(shape => <polyline key={shape.name} points={shape.points.map(point => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#8dd9e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"><title>{shape.name}</title></polyline>)}
            {stateBoundaryShapes.flatMap((state, si) => state.rings.map((ring, ri) => <polyline key={`${si}-${ri}`} points={ring.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#919b89" strokeWidth="1.7" opacity=".78"/>))}
            {stateLabels.map(label => <text key={label.name} x={label.x} y={label.y} textAnchor="middle" className="geography">{label.name}</text>)}
            {riverLabels.map(label => <text key={label.name} x={label.x} y={label.y} textAnchor="middle" className="geography water-label">{label.name}</text>)}
            <text x={bookCliffsShape.label.x} y={bookCliffsShape.label.y} textAnchor="middle" dominantBaseline="middle" className="geography terrain-label">BOOK CLIFFS</text>
            <text x={projectRoadPoint([-113.78,40.82]).x} y={projectRoadPoint([-113.78,40.82]).y} textAnchor="middle" className="geography salt-label"><tspan x={projectRoadPoint([-113.78,40.82]).x} dy="-7">BONNEVILLE</tspan><tspan x={projectRoadPoint([-113.78,40.82]).x} dy="7">SALT</tspan><tspan x={projectRoadPoint([-113.78,40.82]).x} dy="7">FLATS</tspan></text>
            <text x={projectRoadPoint([-112.98,39.10]).x} y={projectRoadPoint([-112.98,39.10]).y} textAnchor="middle" className="geography water-label">SEVIER LAKE</text>
            {mappedLakes.filter(lake => lake.name !== 'Great Salt Lake').map(lake => { const center = lake.name === 'Utah Lake' ? [-111.78, 40.19] : [-111.03, 37.07], point = projectRoadPoint(center as [number, number]); return <text key={lake.name} x={point.x} y={point.y} textAnchor="middle" className="geography water-label">{lake.name}</text>; })}
            {islandShapes.map(island => <polygon key={island.name} points={island.points.map(point => `${point.x},${point.y}`).join(' ')} fill="#e9e1cf" stroke="#c9bea7" strokeWidth="1.2" pointerEvents="none"><title>{island.name}</title></polygon>)}{roadMapSegments.map((segment, index) => { const key = routeKey(segment.a, segment.b), type = settings.roads[key] ?? segment.road, width = type === 'Freeway' ? 2.1 : type === 'Highway' ? 1.55 : type === 'State road' ? 1.3 : .7, points = segment.points.map((point, i) => { const p = i === 0 ? mapPosition(settings, segment.a) : i === segment.points.length - 1 ? mapPosition(settings, segment.b) : point; return `${p.x},${p.y}`; }).join(' '); return <g key={index}><polyline points={points} fill="none" stroke="transparent" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pointerEvents="stroke" onClick={() => setSettings(previous => ({ ...previous, roads: { ...previous.roads, [key]: roadType } }))} style={{ cursor: 'crosshair' }}/><polyline points={points} fill="none" stroke="#f3f2e9" strokeWidth={width + 1.1} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"/><polyline points={points} fill="none" stroke={roadColors[type]} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity=".92" pointerEvents="none"/><title>{`${spaces[segment.a].name} ↔ ${spaces[segment.b].name} · ${type}`}</title></g>; })}


            {(() => { const point = projectRoadPoint([-112.57, 41.19]); return <text x={point.x} y={point.y} textAnchor="middle" className="geography water-label"><tspan x={point.x} dy="-8">GREAT</tspan><tspan x={point.x} dy="8">SALT</tspan><tspan x={point.x} dy="8">LAKE</tspan></text>; })()}
            {Object.values(spaces).filter(space => !space.hub && !hiddenBlackDots.has(`space:${space.id}`)).map(space => { const dotInfo = numberedBlackDots.get(`space:${space.id}`), x = settings.positions[space.id]?.x ?? space.x, y = settings.positions[space.id]?.y ?? space.y; return <g key={space.id} className="admin-dot" onPointerDown={event => { event.stopPropagation(); dragRef.current = space.id; setDragging(space.id); event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId); }}><circle cx={x} cy={y} r="7" fill="transparent" pointerEvents="all"><title>{dotInfo ? `Black dot ${dotInfo.number}: ${dotInfo.name}` : space.name}</title></circle><circle cx={x} cy={y} r="1.025" fill="#17221c" pointerEvents="none"/></g>})}
            {hubs.filter(([id]) => !destinationHubIds.has(id) && !hiddenHubDots.has(id)).map(([id, name, x, y]) => { const dotInfo = numberedBlackDots.get(`hub:${id}`), point = { x: settings.positions[id]?.x ?? x, y: settings.positions[id]?.y ?? y }; return <g key={id} className="admin-dot" onPointerDown={event => { event.stopPropagation(); dragRef.current = id; setDragging(id); event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId); }}><circle cx={point.x} cy={point.y} r={homeBases.includes(id as typeof homeBases[number]) ? 7 : 7} fill="transparent" pointerEvents="all"><title>{dotInfo ? `Black dot ${dotInfo.number}: ${dotInfo.name}` : name}</title></circle><circle cx={point.x} cy={point.y} r={homeBases.includes(id as typeof homeBases[number]) ? 2.75 : 1.2} fill={homeBases.includes(id as typeof homeBases[number]) ? '#e5bd3b' : '#17221c'} stroke="#fffef5" strokeWidth=".6" pointerEvents="none"/></g>})}
            {destinations.flatMap(destination => destinationHubs(destination).map(id => ({ destination, id }))).map(({ destination, id }) => { const base = destinationMarkerPositions.get(id) ?? spaces[id], point = settings.positions[id] ?? base; return <g key={`${destination.id}-${id}`}>{id !== 'yuba-i15-exit' && <line x1={spaces[id].x} y1={spaces[id].y} x2={point.x} y2={point.y} stroke={destinationColor(destination.type)} strokeWidth="1.2" opacity=".8"/>}<circle cx={point.x} cy={point.y} r="1.7" fill={destinationColor(destination.type)} stroke="#fffef5" strokeWidth=".6" className={`admin-dot${dragging === id ? ' active' : ''}`} onPointerDown={event => { event.stopPropagation(); dragRef.current = id; setDragging(id); event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId); }}><title>{`Destination ${destination.id}: ${spaces[id].name}${id === 'halls-crossing' ? ' · Dot #271' : ''}`}</title></circle></g>; })}
            <g className="map-place-names">{placedMapLabels.map(label => { const anchor = settings.positions[label.location] ?? { x: label.anchorX, y: label.anchorY }, dx = anchor.x - label.anchorX, dy = anchor.y - label.anchorY, automatic = { x: label.x + dx, y: label.y + dy }, position = settings.labelPositions?.[label.id] ?? automatic, distance = Math.hypot(position.x - anchor.x, position.y - anchor.y), labelKey = `label|${label.id}`; return <g key={label.id} className="admin-map-label" onPointerDown={event => { event.stopPropagation(); dragRef.current = labelKey; setDragging(labelKey); event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId); }}><rect x={position.x - Math.max(12, label.text.length * (label.color ? 1.4 : 2.1))} y={position.y - 7} width={Math.max(24, label.text.length * (label.color ? 2.8 : 4.2))} height="14" fill="transparent" pointerEvents="all"/><text style={{fill:label.color}} x={position.x} y={position.y} textAnchor="middle" dominantBaseline="middle" className={label.home ? 'start-place-name' : label.id.startsWith('destination-') ? 'destination-place-name' : undefined}>{label.text}</text>{distance > 60 && <line x1={position.x} y1={position.y} x2={anchor.x} y2={anchor.y} stroke="#506352" strokeWidth=".8" opacity=".72" pointerEvents="none"/>}</g>; })}</g>
            <text x="8" y="1094" className="map-note" paintOrder="stroke" stroke="#f3f2e9" strokeWidth="4">ROAD GEOMETRY © OPENSTREETMAP CONTRIBUTORS · LOCAL ROAD SEGMENTS © UGRC · STATE BOUNDARIES © U.S. CENSUS TIGERWEB</text>
          </svg>
        </div>
      </div>
    </section>
  </main>;
}
