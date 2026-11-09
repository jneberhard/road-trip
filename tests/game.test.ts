import assert from 'node:assert/strict';
import {createGame,spaces,neighbors,edges,allowed,roll,move,botTurn,destinations} from '../lib/game.ts';
const reached=new Set(['slc']);const queue=['slc'];for(const id of queue)for(const e of neighbors(id))if(!reached.has(e.to)){reached.add(e.to);queue.push(e.to)}assert.equal(reached.size,Object.keys(spaces).length);
for(let humans=1;humans<=8;humans++)for(let bots=0;bots<=8-humans;bots++){let g=createGame(humans,bots);assert.equal(g.players.length,humans+bots);assert.equal(new Set(g.players[0].cards).size,3)}
assert.throws(()=>createGame(8,1));
let g=createGame(1,0);g.players[0].pos='ogden';g.players[0].road='Freeway';roll(g,5);assert.ok(allowed(g).every(e=>e.road==='Freeway'));g.phase='roll';roll(g,6);assert.ok(allowed(g).some(e=>e.road==='Highway'));
const barrel=edges.find(e=>e.barrel)!;g=createGame(1,0);g.players[0].pos=barrel.a;g.players[0].road=barrel.road;roll(g,3);assert.ok(!allowed(g).some(e=>e.to===barrel.b));g.phase='roll';roll(g,4);assert.ok(allowed(g).some(e=>e.to===barrel.b));move(g,barrel.b);assert.equal(g.players[0].pos,barrel.b);
g=createGame(1,0);const d=destinations[0];let e=neighbors(d.hub)[0];g.players[0].cards=[d.id];g.players[0].pos=e.to;g.players[0].road=e.road;roll(g,6);move(g,d.hub);assert.deepEqual(g.players[0].visited,[d.id]);e=neighbors('slc')[0];g.players[0].pos=e.to;g.players[0].road=e.road;g.phase='roll';roll(g,6);move(g,'slc');assert.equal(g.phase,'won');assert.throws(()=>move(g,e.to));
// Full games ensure the road network and AI can finish, including multi-player turns.
for(let n=0;n<12;n++){g=createGame(1,2);g.players.forEach(p=>p.bot=true);let turns=0;while(g.phase!=='won'&&turns++<5000)botTurn(g);assert.equal(g.phase,'won',`simulation ${n} failed`)}
console.log(`Passed: connectivity (${reached.size} spaces), all player mixes, six-only switching, barrels, collection, winning, and 12 full AI games.`);
