import { readFile, writeFile } from "node:fs/promises";

const mapUrl = new URL("../lib/road-map-data.json", import.meta.url);
const mapData = JSON.parse(await readFile(mapUrl, "utf8"));
const states = ["04", "08", "16", "32", "49", "56"];
const endpoint = new URL("https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0/query");
endpoint.searchParams.set("where", `STATE IN (${states.map((state) => `'${state}'`).join(",")})`);
endpoint.searchParams.set("outFields", "STATE,BASENAME");
endpoint.searchParams.set("returnGeometry", "true");
endpoint.searchParams.set("outSR", "4326");
endpoint.searchParams.set("maxAllowableOffset", "0.004");
endpoint.searchParams.set("geometryPrecision", "5");
endpoint.searchParams.set("f", "geojson");

const response = await fetch(endpoint, { headers: { "User-Agent": "TourOfUtahRoadTripMap/1.0 (map boundary data)" } });
if (!response.ok) throw new Error(`Census TIGERweb returned ${response.status}: ${await response.text()}`);
const geojson = await response.json();
if (!Array.isArray(geojson.features)) throw new Error(`Unexpected TIGERweb response: ${JSON.stringify(geojson).slice(0, 500)}`);

const expected = new Map([["04", "Arizona"], ["08", "Colorado"], ["16", "Idaho"], ["32", "Nevada"], ["49", "Utah"], ["56", "Wyoming"]]);
const boundaries = geojson.features.map((feature) => {
  const stateCode = feature.properties.STATE;
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  return {
    name: expected.get(stateCode) ?? feature.properties.BASENAME,
    rings: polygons.map((polygon) => polygon[0]),
  };
}).filter((boundary) => boundary.name && boundary.rings.length);
const returnedStates = new Set(boundaries.map((boundary) => boundary.name));
for (const name of expected.values()) if (!returnedStates.has(name)) throw new Error(`TIGERweb did not return the ${name} boundary`);

mapData.stateBoundaries = boundaries;
await writeFile(mapUrl, JSON.stringify(mapData));
console.log(`Saved ${boundaries.length} state boundaries from the U.S. Census Bureau TIGERweb service.`);
