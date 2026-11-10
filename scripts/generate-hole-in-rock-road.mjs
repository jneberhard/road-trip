import { readFile, writeFile } from "node:fs/promises";

const mapUrl = new URL("../lib/road-map-data.json", import.meta.url);
const mapData = JSON.parse(await readFile(mapUrl, "utf8"));
const endpoint = new URL("https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahRoads/FeatureServer/0/query");
endpoint.searchParams.set("where", "FULLNAME LIKE '%HOLE%' OR FULLNAME LIKE '%ROCK%' OR NAME LIKE '%HOLE%' OR NAME LIKE '%ROCK%'");
endpoint.searchParams.set("geometry", "-111.7,36.95,-109.9,37.8");
endpoint.searchParams.set("geometryType", "esriGeometryEnvelope");
endpoint.searchParams.set("inSR", "4326");
endpoint.searchParams.set("outFields", "FULLNAME,NAME,CARTOCODE");
endpoint.searchParams.set("returnGeometry", "true");
endpoint.searchParams.set("outSR", "4326");
endpoint.searchParams.set("f", "geojson");

const sourceCache = new URL("../lib/hole-road-source.json", import.meta.url);
let result;
try {
  result = JSON.parse(await readFile(sourceCache, "utf8"));
} catch {
  const response = await fetch(endpoint, { headers: { "User-Agent": "TourOfUtahRoadTripMap/1.0 (static route geometry build)" } });
  if (!response.ok) throw new Error(`UGRC Utah Roads returned ${response.status}: ${await response.text()}`);
  result = await response.json();
}
const roadLines = result.features.filter((feature) => feature.properties?.FULLNAME === "HOLE IN THE ROCK RD");
if (!roadLines.length) throw new Error("UGRC did not return Hole in the Rock Road centerlines");

const pointKey = ([longitude, latitude]) => `${Math.round(longitude * 100000)},${Math.round(latitude * 100000)}`;
const graph = new Map();
function distanceKm(a, b) {
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const dLat = toRadians(b[1] - a[1]), dLon = toRadians(b[0] - a[0]);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a[1])) * Math.cos(toRadians(b[1])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q));
}
function addEdge(a, b) {
  const ka = pointKey(a), kb = pointKey(b);
  if (ka === kb) return;
  if (!graph.has(ka)) graph.set(ka, { point: a, edges: [] });
  if (!graph.has(kb)) graph.set(kb, { point: b, edges: [] });
  const length = distanceKm(graph.get(ka).point, graph.get(kb).point);
  graph.get(ka).edges.push({ to: kb, length });
  graph.get(kb).edges.push({ to: ka, length });
}
for (const feature of roadLines) {
  const lines = feature.geometry.type === "MultiLineString" ? feature.geometry.coordinates : [feature.geometry.coordinates];
  for (const line of lines) for (let i = 1; i < line.length; i++) addEdge(line[i - 1], line[i]);
}

function nearestNode(point) {
  let bestKey = null, bestDistance = Infinity;
  for (const [key, node] of graph) {
    const distance = distanceKm(point, node.point);
    if (distance < bestDistance) { bestKey = key; bestDistance = distance; }
  }
  if (!bestKey || bestDistance > 10) throw new Error(`Road centerline is ${bestDistance.toFixed(2)} km from a route stop`);
  return { key: bestKey, point: graph.get(bestKey).point, distance: bestDistance };
}

class MinHeap {
  values = [];
  push(value) { this.values.push(value); let i = this.values.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (this.values[p].distance <= value.distance) break; this.values[i] = this.values[p]; i = p; } this.values[i] = value; }
  pop() { if (!this.values.length) return null; const top = this.values[0], last = this.values.pop(); if (this.values.length) { let i = 0; while (true) { let c = i * 2 + 1; if (c >= this.values.length) break; if (c + 1 < this.values.length && this.values[c + 1].distance < this.values[c].distance) c++; if (this.values[c].distance >= last.distance) break; this.values[i] = this.values[c]; i = c; } this.values[i] = last; } return top; }
}
function shortestPath(start, goal) {
  const distances = new Map([[start, 0]]), previous = new Map(), heap = new MinHeap();
  heap.push({ key: start, distance: 0 });
  while (heap.values.length) {
    const current = heap.pop();
    if (current.distance !== distances.get(current.key)) continue;
    if (current.key === goal) break;
    for (const edge of graph.get(current.key).edges) {
      const nextDistance = current.distance + edge.length;
      if (nextDistance < (distances.get(edge.to) ?? Infinity)) { distances.set(edge.to, nextDistance); previous.set(edge.to, current.key); heap.push({ key: edge.to, distance: nextDistance }); }
    }
  }
  if (!distances.has(goal)) throw new Error("The Hole-in-the-Rock Road centerline is disconnected between Coyote Gulch and the Hole");
  const keys = [goal];
  while (keys[0] !== start) keys.unshift(previous.get(keys[0]));
  return { points: keys.map((key) => graph.get(key).point), distance: distances.get(goal) };
}

const start = nearestNode(mapData.locations["coyote-gulch"]);
// The current Hole-in-the-Rock site is at the western edge of Lake Powell.
// Its previous map pin was about 70 km too far east.
const holeReference = [-110.9002, 37.2564];
const end = nearestNode(holeReference);
const route = shortestPath(start.key, end.key);
if (route.distance < 20 || route.distance > 70) throw new Error(`Unexpected road distance from Coyote Gulch to Hole-in-the-Rock: ${route.distance.toFixed(1)} km`);

function simplify(points, tolerance = 0.00015) {
  if (points.length < 3) return points;
  const first = points[0], last = points.at(-1), dx = last[0] - first[0], dy = last[1] - first[1];
  let farthest = 0, maxDistance = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i], t = Math.max(0, Math.min(1, ((point[0] - first[0]) * dx + (point[1] - first[1]) * dy) / (dx * dx + dy * dy || 1)));
    const deviation = Math.hypot(point[0] - (first[0] + t * dx), point[1] - (first[1] + t * dy));
    if (deviation > maxDistance) { maxDistance = deviation; farthest = i; }
  }
  if (maxDistance <= tolerance) return [first, last];
  return [...simplify(points.slice(0, farthest + 1), tolerance).slice(0, -1), ...simplify(points.slice(farthest), tolerance)];
}

mapData.locations["coyote-gulch"] = start.point;
mapData.locations["hole-in-rock"] = end.point;
mapData.routes["coyote-gulch|hole-in-rock"] = simplify(route.points);
delete mapData.routes["halls-crossing|hole-in-rock"];
const escalantePath = mapData.routes["escalante|coyote-gulch"];
if (escalantePath) escalantePath[escalantePath.length - 1] = start.point;
await writeFile(mapUrl, JSON.stringify(mapData));
console.log(`Bundled ${route.points.length} UGRC road points (${route.distance.toFixed(1)} km, snapped ${start.distance.toFixed(2)} km / ${end.distance.toFixed(2)} km from Coyote Gulch / Hole access).`);
