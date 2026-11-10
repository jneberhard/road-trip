import cards from './cards.json';
import { bookCliffsShape, destinationHubs, destinations, homeBases, hubs, mappedLakes, mountainShapes, projectRoadPoint, riverLabels, routeShapes, spaces, stateLabels } from './game';

export const roadColors = { Freeway: '#1769aa', Highway: '#d44444', 'State road': '#27834d', 'County road': '#92968b' } as const;
export const cityLabels = new Set(['salt-lake-city','ogden','logan','brigham-city','tremonton','i84-idaho-border','i84-sr30-junction','boise','malad-city','pocatello','preston','park-valley','oasis','provo','orem','spanish-fork','nephi','fillmore','delta','salina','richfield','price','green-river','moab','blanding','bluff','monticello','vernal','roosevelt','duchesne','heber-city','park-city','tooele','cedar-city','parowan','panguitch','circleville','bryce-canyon','kanab','st-george','mesquite','evanston','rock-springs','cortez','page','grand-canyon','grand-canyon-south-rim','jacob-lake','ely','coalville','milford','hanksville','torrey','escalante','cisco','vernon','simpson-springs','thistle','yuba-i15-exit']);
export const destinationHubIds = new Set(destinations.flatMap(destination => destinationHubs(destination)));
type DestinationMarker = { hub: string; x: number; y: number; anchorX: number; anchorY: number };
function closestRoadPoint(points: { x: number; y: number }[], target: { x: number; y: number }) {
  let closest = points[0], bestDistance = Infinity;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((target.x - a.x) * dx + (target.y - a.y) * dy) / (dx * dx + dy * dy)));
    const point = { x: a.x + t * dx, y: a.y + t * dy }, distance = Math.hypot(target.x - point.x, target.y - point.y);
    if (distance < bestDistance) { closest = point; bestDistance = distance; }
  }
  return closest;
}
const i15FromNephi = routeShapes.find(route => route.road === 'Freeway' && new Set([route.a, route.b]).has('nephi') && new Set([route.a, route.b]).has('fillmore'));
const destinationMarkerSeeds: DestinationMarker[] = destinations.flatMap(destination => destinationHubs(destination).map(hub => {
  const anchor = spaces[hub], point = destination.id === 30 && i15FromNephi ? closestRoadPoint(i15FromNephi.points, anchor) : anchor;
  return { hub, x: point.x, y: point.y, anchorX: point.x, anchorY: point.y };
}));
for (let pass = 0; pass < 100; pass++) {
  let moved = false;
  for (let i = 0; i < destinationMarkerSeeds.length; i++) for (let j = i + 1; j < destinationMarkerSeeds.length; j++) {
    const a = destinationMarkerSeeds[i], b = destinationMarkerSeeds[j];
    if (a.hub === 'yuba-i15-exit' || b.hub === 'yuba-i15-exit') continue;
    const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy), minimum = 9;
    if (distance >= minimum) continue;
    const angle = i * 2.399963229728653 + j * .7548776662466927, ux = distance > 1e-3 ? dx / distance : Math.cos(angle), uy = distance > 1e-3 ? dy / distance : Math.sin(angle), push = (minimum - distance) * .51;
    a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; moved = true;
  }
  if (!moved) break;
}
export const destinationMarkerPositions = new Map(destinationMarkerSeeds.map(marker => [marker.hub, marker]));
export const hiddenHubDots = new Set(hubs.filter(([id,,x,y]) => !destinationHubIds.has(id) && destinationMarkerSeeds.some(marker => Math.hypot(x - marker.anchorX, y - marker.anchorY) < 7)).map(([id]) => id));
const blackDotPositions: { x: number; y: number; r: number }[] = [];
export const hiddenBlackDots = new Set<string>();
function registerBlackDot(id: string, x: number, y: number, r: number) {
  if (blackDotPositions.some(dot => Math.hypot(x - dot.x, y - dot.y) < r + dot.r + .6)) { hiddenBlackDots.add(id); return; }
  blackDotPositions.push({ x, y, r });
}
for (const marker of destinationMarkerSeeds) blackDotPositions.push({ x: marker.x, y: marker.y, r: 4 });
for (const [id,,x,y] of [...hubs].sort((a,b) => Number(cityLabels.has(b[0])) - Number(cityLabels.has(a[0])))) if (!destinationHubIds.has(id) && !hiddenHubDots.has(id)) registerBlackDot(`hub:${id}`, x, y, 2.4);
for (const space of Object.values(spaces).filter(space => !space.hub)) registerBlackDot(`space:${space.id}`, space.x, space.y, 2.05);

export type MapLabel = { id: string; text: string; x: number; y: number; anchorX: number; anchorY: number; location: string; priority: number; home?: boolean };
type LabelBox = { left: number; right: number; top: number; bottom: number };
const labelRoadSegments = routeShapes.flatMap(route => route.points.slice(1).map((point,i) => ({ a: route.points[i], b: point })));
const fixedMapLabels: LabelBox[] = [...stateLabels.map(label => ({ x: label.x, y: label.y, text: label.name })), ...riverLabels.map(label => ({ x: label.x, y: label.y, text: label.name })), ...[{ x: bookCliffsShape.label.x, y: bookCliffsShape.label.y, text: bookCliffsShape.name }, ...mountainShapes.filter(shape => shape.name !== 'Tushar Mountains').map(shape => ({ x: shape.label.x, y: shape.label.y + 28, text: shape.name }))], ...mappedLakes.map(lake => {
  const point = projectRoadPoint(lake.name === 'Great Salt Lake' ? [-112.57,41.19] : lake.name === 'Utah Lake' ? [-111.78,40.19] : [-110.98,37.42]);
  return { x: point.x, y: point.y, text: lake.name };
})].map(label => ({ left: label.x - label.text.length * 3.5 - 3, right: label.x + label.text.length * 3.5 + 3, top: label.y - 10, bottom: label.y + 4 }));
for (const [text,point] of [['BONNEVILLE SALT FLATS',[-113.88,40.765]],['SEVIER LAKE',[-112.98,39.10]]] as const) {
  const p = projectRoadPoint([point[0], point[1]]), width = text.length * 3.5 + 3;
  fixedMapLabels.push({ left: p.x - width, right: p.x + width, top: p.y - 10, bottom: p.y + 4 });
}
const seeds: MapLabel[] = hubs.filter(([id]) => (cityLabels.has(id) && !destinationHubIds.has(id)) || homeBases.includes(id as typeof homeBases[number])).map(([id,text,x,y]) => ({ id, text, x, y, anchorX: x, anchorY: y, location: id, priority: homeBases.includes(id as typeof homeBases[number]) ? 0 : 2, home: homeBases.includes(id as typeof homeBases[number]) }));
for (const destination of destinations) for (const hub of destinationHubs(destination)) {
  const point = destinationMarkerPositions.get(hub) ?? spaces[hub];
  const name = destination.id === 30 ? 'Yuba Lake · Yuba State Park' : destination.id === 41 ? `Grand Canyon · ${hub === 'grand-canyon' ? 'North Rim' : 'South Rim'}` : cards.find(card => card.id === destination.id)?.name ?? `Destination ${destination.id}`;
  seeds.push({ id: `destination-${destination.id}-${hub}`, text: name, x: point.x, y: point.y, anchorX: point.x, anchorY: point.y, location: hub, priority: 1 });
}
function intersectsRoad(box: LabelBox) {
  return labelRoadSegments.some(({a,b}) => {
    const minX = box.left - 3, maxX = box.right + 3, minY = box.top - 3, maxY = box.bottom + 3;
    if (Math.max(a.x,b.x) < minX || Math.min(a.x,b.x) > maxX || Math.max(a.y,b.y) < minY || Math.min(a.y,b.y) > maxY) return false;
    let t0 = 0, t1 = 1; const dx = b.x - a.x, dy = b.y - a.y;
    for (const [p,q] of [[-dx,a.x-minX],[dx,maxX-a.x],[-dy,a.y-minY],[dy,maxY-a.y]]) {
      if (p === 0) { if (q < 0) return false; continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) return false; t0 = Math.max(t0,r); } else { if (r < t0) return false; t1 = Math.min(t1,r); }
    }
    return true;
  });
}
function labelBox(x: number, y: number, text: string): LabelBox {
  const width = Math.max(12, text.length * 3.15 + 4);
  return { left: x - width / 2, right: x + width / 2, top: y - 4.5, bottom: y + 2 };
}
export const placedMapLabels: MapLabel[] = [];
const placedBoxes: LabelBox[] = [];
for (const seed of [...seeds].sort((a,b) => a.priority - b.priority || a.text.localeCompare(b.text))) {
  let best: { label: MapLabel; box: LabelBox; score: number } | undefined;
  const allAngles = Array.from({ length: 16 }, (_,i) => i * Math.PI / 8), preferredAngle = seed.id === 'blanding' ? 0 : seed.location === 'halls-crossing' || seed.id === 'salina' || seed.text.startsWith('Snow College') ? Math.PI : undefined;
  const preferredAngles = preferredAngle === undefined ? [] : [preferredAngle, preferredAngle - Math.PI / 8, preferredAngle + Math.PI / 8];
  const angles = [...preferredAngles, ...allAngles.filter(angle => !preferredAngles.some(preferred => Math.abs(angle - preferred) < .001 || Math.abs(Math.abs(angle - preferred) - Math.PI * 2) < .001))], distances = [7,10,14,19,25,33,42,54,68,86,108,134,164,198,235];
  for (const distance of distances) for (const angle of angles) {
    const x = seed.x + Math.cos(angle) * distance, y = seed.y + Math.sin(angle) * distance;
    if (x < 30 || x > 890 || y < 20 || y > 1080 || (seed.id === 'ogden' && y >= seed.anchorY) || (seed.id === 'blanding' && x <= seed.anchorX + 17) || (seed.location === 'halls-crossing' && x >= seed.anchorX - 17)) continue;
    const candidate = { ...seed, x, y }, box = labelBox(x,y,seed.text), dotConflict = blackDotPositions.some(dot => box.left < dot.x + dot.r + 2 && box.right > dot.x - dot.r - 2 && box.top < dot.y + dot.r + 2 && box.bottom > dot.y - dot.r - 2);
    if (dotConflict || intersectsRoad(box) || fixedMapLabels.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top) || placedBoxes.some(other => box.left < other.right + 2 && box.right > other.left - 2 && box.top < other.bottom + 2 && box.bottom > other.top - 2)) continue;
    if (!best || distance < best.score) best = { label: candidate, box, score: distance };
  }
  if (best) { placedMapLabels.push(best.label); placedBoxes.push(best.box); }
}
