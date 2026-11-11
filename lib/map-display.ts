import cards from './cards.json';
import blackDotNumberIds from './black-dot-number-ids.json';
import { bookCliffsShape, destinationHubs, destinations, homeBases, hubs, mappedLakes, mountainShapes, projectRoadPoint, riverLabels, routeShapes, spaces, stateLabels } from './game';

export const hiddenTerrainLabels = new Set(['Tushar Mountains', 'Pavant Range', 'Wasatch Plateau', 'Wasatch Range']);
export const roadColors = { Freeway: '#1769aa', Highway: '#d44444', 'State road': '#27834d', 'County road': '#92968b' } as const;
export const destinationColor = (type: string) => type === 'easy' ? '#2478cc' : type === 'hard' ? '#d54b3f' : '#318b57';
export const cityLabels = new Set(['salt-lake-city','ogden','logan','brigham-city','tremonton','i84-idaho-border','i84-sr30-junction','boise','malad-city','pocatello','preston','park-valley','oasis','provo','orem','spanish-fork','nephi','fillmore','delta','salina','richfield','price','green-river','moab','blanding','bluff','monticello','vernal','roosevelt','duchesne','heber-city','park-city','tooele','cedar-city','parowan','panguitch','circleville','bryce-canyon','kanab','st-george','mesquite','evanston','rock-springs','cortez','page','grand-canyon','grand-canyon-south-rim','jacob-lake','ely','coalville','milford','hanksville','torrey','escalante','cisco','vernon','simpson-springs','thistle']);
export const destinationHubIds = new Set(destinations.flatMap(destination => destinationHubs(destination)));
type DestinationMarker = { hub: string; x: number; y: number; anchorX: number; anchorY: number };
const destinationMarkerSeeds: DestinationMarker[] = destinations.flatMap(destination => destinationHubs(destination).map(hub => {
  const anchor = spaces[hub];
  return { hub, x: anchor.x, y: anchor.y, anchorX: anchor.x, anchorY: anchor.y };
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
export const numberedBlackDots = new Map<string, { number: number; name: string }>();
const blackDotNumberById = new Map(blackDotNumberIds as Array<[string, number]>);
let nextBlackDotNumber = Math.max(0, ...blackDotNumberIds.map(([, number]) => number)) + 1;
function registerBlackDot(id: string, x: number, y: number, r: number, name: string) {
  if (blackDotPositions.some(dot => Math.hypot(x - dot.x, y - dot.y) < r + dot.r + .6)) { hiddenBlackDots.add(id); return; }
  blackDotPositions.push({ x, y, r });
  numberedBlackDots.set(id, { number: blackDotNumberById.get(id) ?? nextBlackDotNumber++, name });
}
for (const marker of destinationMarkerSeeds) blackDotPositions.push({ x: marker.x, y: marker.y, r: 4 });
for (const [id,name,x,y] of [...hubs].sort((a,b) => Number(cityLabels.has(b[0])) - Number(cityLabels.has(a[0])))) if (!destinationHubIds.has(id) && !homeBases.includes(id as typeof homeBases[number]) && !hiddenHubDots.has(id)) registerBlackDot(`hub:${id}`, x, y, 2.4, name);
for (const space of Object.values(spaces).filter(space => !space.hub)) registerBlackDot(`space:${space.id}`, space.x, space.y, 2.05, space.name);
// Dot #241 crowds #360 at this junction. Keep #360 as the visible marker;
// retain the occupied position above so neighboring hidden dots stay hidden.
hiddenBlackDots.add('space:monument-valley-kayenta-1');
numberedBlackDots.delete('space:monument-valley-kayenta-1');
export const blackDotLocationIds = new Set([...numberedBlackDots.keys()].map(id => id.slice(id.indexOf(':') + 1)));

export type MapLabel = { id: string; text: string; x: number; y: number; anchorX: number; anchorY: number; location: string; priority: number; home?: boolean; color?: string };
type LabelBox = { left: number; right: number; top: number; bottom: number };
const labelRoadSegments = routeShapes.flatMap(route => route.points.slice(1).map((point,i) => ({ a: route.points[i], b: point })));
const fixedMapLabels: LabelBox[] = [...stateLabels.map(label => ({ x: label.x, y: label.y, text: label.name })), ...riverLabels.map(label => ({ x: label.x, y: label.y, text: label.name })), ...[{ x: bookCliffsShape.label.x, y: bookCliffsShape.label.y, text: bookCliffsShape.name }, ...mountainShapes.filter(shape => !hiddenTerrainLabels.has(shape.name)).map(shape => ({ x: shape.label.x, y: shape.label.y + 28, text: shape.name }))], ...mappedLakes.map(lake => {
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
  const name = destination.id === 30 ? 'Yuba Lake · Yuba - SP' : destination.id === 41 ? `Grand Canyon · ${hub === 'grand-canyon' ? 'North Rim' : 'South Rim'}` : cards.find(card => card.id === destination.id)?.name ?? `Destination ${destination.id}`;
  seeds.push({ id: `destination-${destination.id}-${hub}`, text: name, x: point.x, y: point.y, anchorX: point.x, anchorY: point.y, location: hub, priority: 1, color: destinationColor(destination.type) });
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
function destinationLabelBox(x: number, y: number, text: string): LabelBox {
  // Destination text is 4.3px, smaller than city text, with a 2px halo.
  const width = Math.max(12, text.length * 2.5 + 4);
  return { left: x - width / 2, right: x + width / 2, top: y - 3.5, bottom: y + 3.5 };
}
export const placedMapLabels: MapLabel[] = [];
const placedBoxes: LabelBox[] = [];
// Reserve these requested placements before automatically arranging nearby labels.
const pinnedLabelDirections: Record<string, 'west' | 'above' | 'below'> = {
  'grand-canyon': 'west',
  'grand-canyon-south-rim': 'west',
  'hole-in-rock': 'below',
  'navajo-mountain': 'above',
  'rainbow-bridge': 'above',
};
for (const seed of seeds) {
  const direction = pinnedLabelDirections[seed.location];
  if (!direction) continue;
  const box = destinationLabelBox(seed.x, seed.y, seed.text);
  const label = {
    ...seed,
    x: direction === 'west' ? seed.anchorX - (box.right - box.left) / 2 - 8 : seed.anchorX,
    y: seed.anchorY + (direction === 'above' ? -10 : direction === 'below' ? 10 : 0),
  };
  placedMapLabels.push(label);
  placedBoxes.push(destinationLabelBox(label.x, label.y, label.text));
}
function overlaps(a: LabelBox, b: LabelBox, padding = 2) {
  return a.left < b.right + padding && a.right > b.left - padding && a.top < b.bottom + padding && a.bottom > b.top - padding;
}
// Keep a destination's text edge within 22 map units of its marker. Roads
// are a soft constraint so a busy junction cannot send its name far away.
const destinationCandidates = new Map<number, { label: MapLabel; box: LabelBox; score: number }[]>();
for (const seed of seeds.filter(seed => seed.color).sort((a,b) => a.text.localeCompare(b.text))) {
  if (pinnedLabelDirections[seed.location]) continue;
  const halfWidth = (destinationLabelBox(0, 0, seed.text).right - destinationLabelBox(0, 0, seed.text).left) / 2;
  const candidates: { label: MapLabel; box: LabelBox; score: number }[] = [];
  for (const gap of [8, 11, 15, 19]) {
    const offsets = [
      ...[-1, 1].flatMap(side => [0, -halfWidth / 2, halfWidth / 2].map(dx => [dx, side * (gap + 3)])),
      ...[-1, 1].flatMap(side => [0, -8, 8].map(dy => [side * (halfWidth + gap), dy])),
    ];
    for (const [dx, dy] of offsets) {
      const label = { ...seed, x: seed.anchorX + dx, y: seed.anchorY + dy }, box = destinationLabelBox(label.x, label.y, label.text);
      if (box.left < 2 || box.right > 918 || box.top < 2 || box.bottom > 1085) continue;
      const dotConflicts = blackDotPositions.filter(dot => overlaps(box, { left: dot.x - dot.r, right: dot.x + dot.r, top: dot.y - dot.r, bottom: dot.y + dot.r })).length;
      const geographyConflicts = fixedMapLabels.filter(other => overlaps(box, other)).length;
      const preferredSide = seed.location === 'monument-valley' ? dx > 0 : seed.location === 'halls-crossing' || seed.location === 'coyote-gulch' || seed.text.startsWith('Snow College') ? dx < 0 : true;
      const score = dotConflicts * 10000 + geographyConflicts * 100 + Number(intersectsRoad(box)) * 20 + gap + Math.abs(dx) * .05 + Number(!preferredSide) * 5;
      candidates.push({ label, box, score });
    }
  }
  const score = (candidate: typeof candidates[number]) => candidate.score + placedBoxes.filter(other => overlaps(candidate.box, other)).length * 1000000;
  const best = candidates.sort((a,b) => score(a) - score(b))[0];
  if (best) {
    destinationCandidates.set(placedMapLabels.length, candidates);
    placedMapLabels.push(best.label); placedBoxes.push(best.box);
  }
}
// Revisit crowded clusters so an earlier name can make room for a later one.
for (let pass = 0; pass < 12; pass++) {
  let changed = false;
  for (const [index, candidates] of destinationCandidates) {
    const score = (candidate: typeof candidates[number]) => candidate.score + placedBoxes.filter((other, otherIndex) => otherIndex !== index && overlaps(candidate.box, other)).length * 1000000;
    const best = candidates.reduce((a,b) => score(a) <= score(b) ? a : b);
    if (best.label.x !== placedMapLabels[index].x || best.label.y !== placedMapLabels[index].y) changed = true;
    placedMapLabels[index] = best.label;
    placedBoxes[index] = best.box;
  }
  if (!changed) break;
}
for (const seed of [...seeds].filter(seed => !seed.color).sort((a,b) => a.priority - b.priority || a.text.localeCompare(b.text))) {
  let best: { label: MapLabel; box: LabelBox; score: number } | undefined;
  const allAngles = Array.from({ length: 16 }, (_,i) => i * Math.PI / 8), preferredAngle = seed.id === 'blanding' || seed.location === 'monument-valley' ? 0 : seed.location === 'navajo-mountain' ? -Math.PI / 2 : seed.location === 'hole-in-rock' ? Math.PI / 2 : seed.location === 'coyote-gulch' || seed.location === 'halls-crossing' || seed.id === 'salina' || seed.text.startsWith('Snow College') ? Math.PI : undefined;
  const preferredAngles = preferredAngle === undefined ? [] : [preferredAngle, preferredAngle - Math.PI / 8, preferredAngle + Math.PI / 8];
  const angles = [...preferredAngles, ...allAngles.filter(angle => !preferredAngles.some(preferred => Math.abs(angle - preferred) < .001 || Math.abs(Math.abs(angle - preferred) - Math.PI * 2) < .001))], distances = [7,10,14,19,25,33,42,54,68,86,108,134,164,198,235];
  for (const distance of distances) for (const angle of angles) {
    const x = seed.x + Math.cos(angle) * distance, y = seed.y + Math.sin(angle) * distance;
    if (x < 30 || x > 890 || y < 20 || y > 1080 || (seed.id === 'ogden' && y >= seed.anchorY) || ((seed.id === 'blanding' || seed.location === 'monument-valley') && x <= seed.anchorX + 17) || (seed.location === 'halls-crossing' && x >= seed.anchorX - 17) || (seed.location === 'coyote-gulch' && (x >= seed.anchorX - 17 || Math.abs(y - seed.anchorY) > 8)) || (seed.location === 'navajo-mountain' && (y >= seed.anchorY - 17 || Math.abs(x - seed.anchorX) > 8)) || (seed.location === 'hole-in-rock' && (y <= seed.anchorY + 17 || Math.abs(x - seed.anchorX) > 8))) continue;
    const candidate = { ...seed, x, y }, box = labelBox(x,y,seed.text), dotConflict = blackDotPositions.some(dot => box.left < dot.x + dot.r + 2 && box.right > dot.x - dot.r - 2 && box.top < dot.y + dot.r + 2 && box.bottom > dot.y - dot.r - 2);
    if (dotConflict || intersectsRoad(box) || fixedMapLabels.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top) || placedBoxes.some(other => box.left < other.right + 2 && box.right > other.left - 2 && box.top < other.bottom + 2 && box.bottom > other.top - 2)) continue;
    if (!best || distance < best.score) best = { label: candidate, box, score: distance };
  }
  if (best) { placedMapLabels.push(best.label); placedBoxes.push(best.box); }
}
