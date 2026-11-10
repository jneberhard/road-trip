import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const root = new URL("../", import.meta.url);
const gameSource = await readFile(new URL("lib/game.ts", root), "utf8");
const geocodes = JSON.parse(await readFile(new URL("lib/road-map-geocodes.json", root), "utf8"));
const currentHubIds = [...gameSource.matchAll(/\['([^']+)','([^']+)',(-?\d+),(-?\d+)\]/g)].map((match) => match[1]);
const outputUrl = new URL("lib/road-map-data.json", root);
let previousMap = {};
try { previousMap = JSON.parse(await readFile(outputUrl, "utf8")); } catch {}
const manual = {
  "four-corners": [-109.0452, 36.9990],
  "rainbow-bridge": [-110.927328, 36.992479],
  "dinosaur-nm": [-109.3030, 40.4360],
  "canyonlands": [-109.8198, 38.4584],
  "bear-lake": [-111.3930, 41.9460],
  "bryce-canyon": [-112.1670, 37.6280],
  "zion": [-112.9870, 37.2000],
  "capitol-reef": [-111.1680, 38.2860],
  "great-basin": [-114.2570, 39.0050],
  "grand-staircase": [-111.6020, 37.7700],
  "tooele": [-112.2983, 40.5308],
  "vernon": [-112.4335642, 40.0921678],
  "simpson-springs": [-112.7882194, 40.0386056],
  "i84-idaho-border": [-112.83365, 41.99943],
  "boise": [-116.2023, 43.615],
  "malad-city": [-112.250, 42.191],
  "pocatello": [-112.445, 42.871],
  "yuba-i15-exit": [-111.910618, 39.449228],
  "thistle": [-111.4984, 39.9917],
  "grand-canyon": [-112.058, 36.211],
  "grand-canyon-south-rim": [-112.128156, 36.0578075],
  "jacob-lake": [-112.216, 36.716],
  "dugway": [-112.7346, 40.2517],
  "green-river": [-110.1604, 38.9952],
  "beaver": [-112.6416, 38.2769],
  "mountain-meadows": [-113.6436, 37.4755],
  "the-wave": [-112.0060, 36.9960],
  "goshen-movie-set": [-111.9160, 39.9440],
  "meadow-lava-tubes": [-112.4082, 38.8861],
  "fort-kanab": [-112.5285, 37.0482],
  "monument-valley": [-110.0985, 36.9834],
  "natural-bridges": [-110.0018, 37.6010],
  "halls-crossing": [-110.7120, 37.4700],
  "navajo-mountain": [-110.5400, 37.0000],
  "coyote-gulch": [-111.0080, 37.4080],
  "dark-canyon": [-109.9500, 37.6500],
  "hole-in-rock": [-110.9002, 37.2564]
};
const locations = {};
for (const id of currentHubIds) {
  if (previousMap.locations?.[id] && id !== "rainbow-bridge") locations[id] = previousMap.locations[id];
  else if (manual[id]) locations[id] = manual[id];
  else {
    const point = geocodes[id];
    if (!point || point.lat === null || point.lon === null || point.status !== "matched-state") {
      throw new Error(`Missing verified place coordinates for ${id}`);
    }
    locations[id] = [point.lon, point.lat];
  }
}
locations["mountain-meadows"] = manual["mountain-meadows"];
locations["hole-in-rock"] = manual["hole-in-rock"];
locations["dugway"] = manual["dugway"];
locations["vernon"] = manual["vernon"];
locations["simpson-springs"] = manual["simpson-springs"];
locations["i84-idaho-border"] = manual["i84-idaho-border"];
locations["boise"] = manual["boise"];
locations["malad-city"] = manual["malad-city"];
locations["pocatello"] = manual["pocatello"];
locations["yuba-i15-exit"] = manual["yuba-i15-exit"];
locations["thistle"] = manual["thistle"];
locations["grand-canyon"] = manual["grand-canyon"];
locations["grand-canyon-south-rim"] = manual["grand-canyon-south-rim"];
locations["jacob-lake"] = manual["jacob-lake"];

const routesBlock = gameSource.match(/const routeDefinitions:\[string,string,Road\]\[\]\s*=\s*\[([\s\S]*?)\n\];/);
if (!routesBlock) throw new Error("Could not find route list in lib/game.ts");
const routePairs = [...routesBlock[1].matchAll(/\['([^']+)','([^']+)','[^']+'\]/g)]
  .map(([, a, b]) => [a, b]);
const seen = new Set();
const pairs = routePairs.filter(([a, b]) => {
  const key = [a, b].sort().join("|");
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

function simplify(points, tolerance = 0.00015) {
  if (points.length < 3) return points;
  const first = points[0], last = points.at(-1);
  let farthest = 0, maxDistance = 0;
  const dx = last[0] - first[0], dy = last[1] - first[1];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t = Math.max(0, Math.min(1, ((p[0] - first[0]) * dx + (p[1] - first[1]) * dy) / (dx * dx + dy * dy || 1)));
    const distance = Math.hypot(p[0] - (first[0] + t * dx), p[1] - (first[1] + t * dy));
    if (distance > maxDistance) { maxDistance = distance; farthest = i; }
  }
  if (maxDistance <= tolerance) return [first, last];
  return [...simplify(points.slice(0, farthest + 1), tolerance).slice(0, -1), ...simplify(points.slice(farthest), tolerance)];
}

let data = { locations, routes: {}, ...previousMap };
data.locations = locations;
const activeRouteKeys = new Set(pairs.map(([a, b]) => [a, b].sort().join("|")));
for (const key of Object.keys(data.routes)) if (!activeRouteKeys.has(key.split("|").sort().join("|"))) delete data.routes[key];
const endpointDistanceKm = (a, b) => Math.hypot((a[0] - b[0]) * 80, (a[1] - b[1]) * 111);
const endpointCandidates = new Map();
for (const [key, path] of Object.entries(data.routes)) {
  const [a, b] = key.split("|");
  if (endpointDistanceKm(path[0], locations[a]) > 8 || endpointDistanceKm(path.at(-1), locations[b]) > 8) {
    delete data.routes[key];
    continue;
  }
  for (const [id, point] of [[a, path[0]], [b, path.at(-1)]]) {
    const distance = endpointDistanceKm(point, locations[id]);
    if (!endpointCandidates.has(id) || endpointCandidates.get(id).distance > distance) endpointCandidates.set(id, { point, distance });
  }
}
const snapped = new Set();
for (const [id, candidate] of endpointCandidates) {
  if (candidate.distance > 0.6 && candidate.distance <= 8) {
    locations[id] = candidate.point;
    snapped.add(id);
    console.log(`Snapped ${id} to mapped road access (${candidate.distance.toFixed(1)} km)`);
  }
}
data.locations = locations;
if (snapped.size) for (const key of Object.keys(data.routes)) if (key.split("|").some((id) => snapped.has(id))) delete data.routes[key];
await writeFile(outputUrl, JSON.stringify(data));
for (const [a, b] of pairs) {
  const key = `${a}|${b}`;
  const reverseKey = `${b}|${a}`;
  if (data.routes[key]?.length > 1 || data.routes[reverseKey]?.length > 1) continue;
  const [fromLon, fromLat] = locations[a];
  const [toLon, toLat] = locations[b];
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&steps=false`;
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { headers: { "User-Agent": "TourOfUtahRoadTripMap/1.0 (static board map build)" } });
    if (response.status !== 429 && response.status < 500) break;
    await delay(2500 * (attempt + 1));
  }
  if (!response.ok) throw new Error(`Router returned ${response.status} for ${a} → ${b}: ${await response.text()}`);
  const result = await response.json();
  const coords = result.routes?.[0]?.geometry?.coordinates;
  if (!coords?.length) throw new Error(`No drivable route for ${a} → ${b}`);
  data.routes[key] = coords;
  await writeFile(outputUrl, JSON.stringify(data));
  console.log(`Routed ${Object.keys(data.routes).length}/${pairs.length}: ${a} → ${b}`);
  if (Object.keys(data.routes).length < pairs.length) await delay(1100);
}
for (const [key, coords] of Object.entries(data.routes)) data.routes[key] = simplify(coords);
await writeFile(outputUrl, JSON.stringify(data));
console.log(`Saved ${Object.keys(data.routes).length} simplified road paths for ${currentHubIds.length} locations.`);
