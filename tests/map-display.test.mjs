import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  stdin: { contents: "export * from './lib/map-display'; export { destinations, destinationHubs } from './lib/game';", resolveDir: process.cwd() },
  bundle: true, platform: 'node', format: 'esm', write: false,
});
const map = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const labels = map.placedMapLabels.filter(label => label.color);
const expectedColors = { easy: '#2478cc', hard: '#d54b3f', education: '#318b57' };
let maxGap = 0;
for (const destination of map.destinations) for (const hub of map.destinationHubs(destination)) {
  const matches = labels.filter(label => label.id === `destination-${destination.id}-${hub}`);
  assert.equal(matches.length, 1, `${hub}: exactly one label`);
  const label = matches[0], marker = map.destinationMarkerPositions.get(hub);
  assert.equal(label.color, expectedColors[destination.type], `${hub}: marker color`);
  assert.equal(label.anchorX, marker.x);
  assert.equal(label.anchorY, marker.y);
  const halfWidth = Math.max(12, label.text.length * 2.5 + 4) / 2;
  const gap = Math.hypot(Math.max(0, Math.abs(label.x - marker.x) - halfWidth), Math.max(0, Math.abs(label.y - marker.y) - 3.5));
  assert.ok(gap <= 22, `${hub}: label is too distant (${gap})`);
  maxGap = Math.max(maxGap, gap);
  if (hub.startsWith('grand-canyon')) { assert.ok(label.x < marker.x); assert.equal(label.y, marker.y); }
  if (hub === 'navajo-mountain' || hub === 'rainbow-bridge') { assert.equal(label.x, marker.x); assert.ok(label.y < marker.y); }
  if (hub === 'hole-in-rock') { assert.equal(label.x, marker.x); assert.equal(label.y - marker.y, 10); }
}
const overlaps = [];
for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
  const a = labels[i], b = labels[j];
  if (Math.abs(a.y - b.y) < 9 && Math.abs(a.x - b.x) < (a.text.length + b.text.length) * 2.5 / 2 + 6) overlaps.push(`${a.text} / ${b.text}`);
}
assert.deepEqual(overlaps, [], 'Destination labels must not overlap');
console.log(`Passed: all ${labels.length} destination labels present, matching marker colors, nearby (maximum text-edge gap ${maxGap.toFixed(1)}), and non-overlapping; requested placements preserved.`);
