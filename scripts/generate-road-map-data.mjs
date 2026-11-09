import { readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const source = await readFile(new URL("../lib/game.ts", import.meta.url), "utf8");
const cards = JSON.parse(await readFile(new URL("../lib/cards.json", import.meta.url), "utf8"));
const destinationBlock = source.match(/export const destinationLocations=\[([\s\S]*?)\] as const/);
if (!destinationBlock) throw new Error("Could not find destination locations in lib/game.ts");
const destinationIds = destinationBlock[1].match(/'([^']+)'/g).map((id) => id.slice(1, -1));
const hubRows = [...source.matchAll(/\['([^']+)','([^']+)',(-?\d+),(-?\d+)\]/g)];
const hubs = hubRows.map(([, id, name, x, y]) => ({ id, name, x: Number(x), y: Number(y) }));

const stateNames = { AZ: "Arizona", CO: "Colorado", ID: "Idaho", NV: "Nevada", UT: "Utah", WY: "Wyoming" };
const stateByHub = new Map();
for (const hub of hubs) {
  const suffix = hub.name.match(/,\s*(AZ|CO|ID|NV|UT|WY)$/)?.[1];
  stateByHub.set(hub.id, suffix ?? "UT");
}
stateByHub.set("the-wave", "AZ");
stateByHub.set("grand-canyon", "AZ");
stateByHub.set("four-corners", "AZ");
stateByHub.set("glen-canyon-dam", "AZ");
stateByHub.set("dinosaur-nm", "UT");
stateByHub.set("mesa-verde", "CO");
stateByHub.set("cortez", "CO");

const cardById = new Map(cards.map((card) => [card.id, card]));
const destinationCardByHub = new Map(destinationIds.map((hub, index) => [hub, cardById.get(index + 1)]));
const partialUrl = new URL("../lib/road-map-geocodes.partial.json", import.meta.url);
let locations = {};
try { locations = JSON.parse(await readFile(new URL("../lib/road-map-geocodes.json", import.meta.url), "utf8")); } catch {}
try { locations = { ...locations, ...JSON.parse(await readFile(partialUrl, "utf8")) }; } catch {}
const overrides = {
  "four-corners": "Four Corners Monument",
  "simpson-springs": "Simpson Springs",
  "living-planet-aquarium": "Loveland Living Planet Aquarium",
  "the-wave": "Wire Pass Trailhead",
  "dinosaur-nm": "Dinosaur National Monument",
  "fremont-indian": "3820 Clear Creek Canyon Road, Sevier",
  "mountain-meadows": "Mountain Meadows Massacre Site",
  "dark-canyon": "Dark Canyon trailhead",
  "glen-canyon-dam": "Glen Canyon Dam, Page",
  "hill-aerospace-museum": "Hill Aerospace Museum",
  "this-is-the-place": "This Is the Place Heritage Park",
  "goshen-movie-set": "12800 Sand Hill Road, Goshen",
  "mount-timpanogos": "Mount Timpanogos Trailhead",
  "starvation-reservoir": "Starvation Reservoir",
  "meadow-lava-tubes": "Meadow, Utah",
  "grand-staircase": "Grand Staircase Escalante National Monument",
  "fort-kanab": "Kanab",
  "utah-fairgrounds": "155 North 1000 West, Salt Lake City",
  "grand-canyon": "Grand Canyon Village",
  "mesa-verde": "Mesa Verde National Park",
  "cortez": "Cortez",
};

for (let i = 0; i < hubs.length; i++) {
  const hub = hubs[i];
  const card = destinationCardByHub.get(hub.id);
  const stateCode = stateByHub.get(hub.id) ?? "UT";
  const place = overrides[hub.id] ?? (card?.name === "Pony Express Trail" ? hub.name : card?.name ?? hub.name);
  const query = `${place}, ${stateNames[stateCode]}, USA`;
  if (locations[hub.id]?.status === "matched-state" && locations[hub.id].query === query) continue;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "us");
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url, { headers: { "User-Agent": "TourOfUtahRoadTripMap/1.0 (static board map build)" } });
    if (response.status !== 429 && response.status < 500) break;
    await delay(2500 * (attempt + 1));
  }
  if (!response.ok) throw new Error(`Geocoder returned ${response.status} for ${hub.id}: ${query}`);
  const candidates = await response.json();
  const expectedState = stateNames[stateCode];
  const selected = candidates.find((candidate) => candidate.address?.state === expectedState) ?? candidates[0];
  if (!selected) {
    locations[hub.id] = { lat: null, lon: null, query, result: null, status: "unmatched" };
  } else {
    locations[hub.id] = {
      lat: Number(selected.lat),
      lon: Number(selected.lon),
      query,
      result: selected.display_name,
      status: selected.address?.state === expectedState ? "matched-state" : "check-state",
    };
  }
  if ((i + 1) % 10 === 0 || i + 1 === hubs.length) {
    await writeFile(partialUrl, JSON.stringify(locations, null, 2));
    console.log(`Geocoded ${i + 1}/${hubs.length}: ${hub.name}${selected ? "" : " (no match)"}`);
  }
  if (i + 1 < hubs.length) await delay(1100);
}

const currentLocations = Object.fromEntries(hubs.map((hub) => [hub.id, locations[hub.id]]));
await writeFile(new URL("../lib/road-map-geocodes.json", import.meta.url), JSON.stringify(currentLocations, null, 2));
console.log(`Saved coordinates for ${Object.values(currentLocations).filter((location) => location?.lat !== null).length}/${hubs.length} places.`);
