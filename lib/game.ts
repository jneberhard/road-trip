import cards from './cards.json';
import {scenarioCards,type ScenarioEffect} from './scenarios';
export type Road = 'Freeway' | 'Highway' | 'State road';
export type StopType='easy'|'hard'|'education';
export type StopMix=Record<StopType,number>;
export const defaultStopMix:StopMix={easy:2,hard:1,education:0};
export const colors = ['#d85535','#277a96','#d49a23','#7b5da5','#329568','#d25c8e','#4a64c1','#745343'];
export const hubs = [
 ['slc','Salt Lake City',300,238],['ogden','Ogden',292,156],['logan','Logan',345,82],['bear','Bear Lake',421,57],
 ['wendover','Salt Flats',85,240],['park','Park City',389,258],['heber','Heber City',407,319],['vernal','Vernal',625,285],
 ['provo','Provo',331,355],['nephi','Nephi',298,438],['delta','Delta',194,484],['price','Price',469,431],
 ['green','Green River',565,522],['moab','Moab',639,592],['arches','Arches',665,552],['canyon','Canyonlands',582,615],
 ['richfield','Richfield',318,552],['reef','Capitol Reef',432,632],['bryce','Bryce Canyon',335,720],['cedar','Cedar City',224,698],
 ['zion','Zion',242,788],['george','St. George',156,823],['kanab','Kanab',329,831],['monument','Monument Valley',600,841],
 ['blanding','Blanding',638,738],['goblin','Goblin Valley',508,584],['flaming','Flaming Gorge',601,182],['evanston','Evanston, WY',470,191],
 ['fillmore','Fillmore',267,595],['bluff','Bluff Balloon Festival',673,787],
] as const;
export type Space={id:string;name:string;x:number;y:number;hub:boolean};
export type Edge={a:string;b:string;road:Road;barrel:boolean};
export const spaces: Record<string,Space> = Object.fromEntries(hubs.map(([id,name,x,y])=>[id,{id,name,x,y,hub:true}]));
export const edges:Edge[]=[];
const routes:[string,string,Road,number,boolean?][]=[
 ['slc','ogden','Freeway',4],['ogden','logan','Highway',4],['logan','bear','Highway',4],['slc','wendover','Freeway',8],
 ['slc','park','Freeway',4],['park','evanston','Freeway',4],['park','heber','Highway',3],['heber','vernal','Highway',8],
 ['vernal','flaming','Highway',4],['slc','provo','Freeway',5],['provo','heber','Highway',4],['provo','nephi','Freeway',4],
 ['nephi','delta','Highway',4],['delta','richfield','Highway',5],['nephi','richfield','Freeway',5],['provo','price','Highway',6],
 ['price','green','Highway',5],['richfield','green','Freeway',9],['green','moab','Highway',4],['moab','arches','State road',2],
 ['moab','canyon','State road',3],['moab','blanding','Highway',6],['blanding','monument','Highway',4],['richfield','reef','State road',5],
 ['reef','goblin','State road',4],['goblin','green','State road',3],['reef','bryce','State road',6],['richfield','cedar','Freeway',7],
 ['cedar','george','Freeway',5],['cedar','bryce','State road',5],['bryce','kanab','Highway',5],['kanab','zion','State road',4],
 ['zion','george','State road',4],['kanab','monument','Highway',10],
 ['ogden','park','Highway',5],['logan','park','Highway',7],['heber','price','Highway',7],['vernal','price','Highway',6],
 ['green','price','Highway',5],['cedar','kanab','Highway',6],['george','kanab','Freeway',7],['moab','reef','Highway',6],
 ['logan','evanston','Highway',7],['delta','cedar','Highway',7],['nephi','price','Highway',8],
 ['richfield','fillmore','Highway',4],['fillmore','nephi','Highway',5],['blanding','bluff','State road',3],['bluff','monument','State road',2]
];
function addRoute(a:string,b:string,road:Road,count:number){
 let prev=a;for(let i=1;i<=count*2;i++){const total=count*2,id=i===total?b:`${a}-${b}-${i}`;if(i<total)spaces[id]={id,name:`${spaces[a].name}–${spaces[b].name} · ${i}/${total}`,x:spaces[a].x+(spaces[b].x-spaces[a].x)*i/total,y:spaces[a].y+(spaces[b].y-spaces[a].y)*i/total,hub:false};edges.push({a:prev,b:id,road,barrel:false});prev=id;}
}
for(const [a,b,road,count] of routes)addRoute(a,b,road,count);
const destinationAnchors=['evanston','wendover','wendover','ogden','ogden','slc','heber','provo','park','bear','heber','slc','slc','slc','slc','provo','slc','slc','slc','price','provo','wendover','provo','heber','ogden','wendover','vernal','logan','logan','nephi','price','nephi','cedar','monument','arches','bryce','canyon','reef','monument','wendover','kanab','monument','monument','kanab','cedar','monument','flaming','monument','monument','delta','kanab','zion','george','cedar','kanab','monument','monument','monument','kanab','kanab','vernal','monument','monument','monument','green','price','monument','monument','goblin','arches','monument','richfield','logan','slc','ogden','provo','provo','richfield','cedar','george'] as const;
const clusterCounts:Record<string,number>={};
export const destinations=cards.map(card=>({id:card.id,hub:`destination-${card.id}`,type:card.id<=32?'easy' as StopType:card.id<=72?'hard' as StopType:'education' as StopType}));
export const homeBases=['george','richfield','blanding','provo','fillmore','slc','ogden','logan'] as const;
for(const destination of destinations){
 const anchor=destinationAnchors[destination.id-1],base=spaces[anchor],n=clusterCounts[anchor]??0;clusterCounts[anchor]=n+1;
 const angle=(n*2.399963+destination.id*.173),radius=18+Math.floor(n/6)*7;
 const x=Math.max(20,Math.min(730,base.x+Math.cos(angle)*radius)),y=Math.max(25,Math.min(890,base.y+Math.sin(angle)*radius));
 const card=cards.find(c=>c.id===destination.id)!;spaces[destination.hub]={id:destination.hub,name:card.name,x,y,hub:true};
 addRoute(anchor,destination.hub,destination.type==='hard'?'State road':destination.type==='education'?'Freeway':'Highway',Math.max(1,Math.round(radius/12)));
}
export type Player={name:string;bot:boolean;pos:string;homeBase:string;road:Road|null;cards:number[];visited:number[];cones:string[];hand:string[];skipTurns:number;extraTurns:number;passCount:number;electricRoad:Road|null;doubleTurn:boolean;slowRoad:Road|null;token?:string};
export type Game={players:Player[];turn:number;round:number;roll:number;left:number;phase:'lobby'|'cones'|'roll'|'move'|'relocate'|'question'|'event'|'hand'|'won';pending:number|null;pendingQuestion:string|null;questionDeadline:number|null;pendingScenario:string|null;pendingRoad:Road|null;coneToMove:string|null;coneMovedThisTurn:boolean;scenarioDeck:string[];scenarioDiscard:string[];stock:number[];stopMix:StopMix;log:string[];winner:number|null;humans:number;online:boolean;host?:string;rev:number};
export function edgeKey(a:string,b:string){return [a,b].sort().join('|')}
export function isConstruction(g:Game,e:Edge){const key=edgeKey(e.a,e.b);return e.barrel||g.players.some(p=>p.cones.includes(key))}
export function die(){return 1+Math.floor(Math.random()*6)}
export function createGame(humans:number,bots:number,name='You',online=false,stopMix:StopMix=defaultStopMix):Game{
 if(!Number.isInteger(humans)||!Number.isInteger(bots)||humans<1||bots<0||humans+bots>8)throw Error('Choose 1–8 players with at least one human.');
 const total=stopMix.easy+stopMix.hard+stopMix.education,count=humans+bots;
 if(![stopMix.easy,stopMix.hard,stopMix.education].every(n=>Number.isInteger(n)&&n>=0)||!Number.isInteger(total)||total<1)throw Error('Choose at least one stop and use whole numbers for each type.');
 if(stopMix.easy*count>32||stopMix.hard*count>40||stopMix.education*count>8)throw Error('There are not enough unique cards for that stop mix and player count.');
 const pools:Record<StopType,number[]>={easy:destinations.filter(d=>d.type==='easy').map(d=>d.id),hard:destinations.filter(d=>d.type==='hard').map(d=>d.id),education:destinations.filter(d=>d.type==='education').map(d=>d.id)};
 for(const pool of Object.values(pools))for(let j=pool.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[pool[j],pool[k]]=[pool[k],pool[j]];}
 const players:Player[]=[];
 for(let i=0;i<count;i++){
  const assigned:number[]=[];for(const type of ['easy','hard','education'] as StopType[])assigned.push(...pools[type].splice(0,stopMix[type]));
  const homeBase=homeBases[Math.floor(Math.random()*homeBases.length)];
  players.push({name:i===0?name:i<humans?`Driver ${i+1}`:`Computer ${i-humans+1}`,bot:i>=humans,pos:homeBase,homeBase,road:null,cards:assigned,visited:[],cones:[],hand:[],skipTurns:0,extraTurns:0,passCount:0,electricRoad:null,doubleTurn:false,slowRoad:null});
 }
 const stock=[...pools.easy,...pools.hard,...pools.education];
 const scenarioDeck=scenarioCards.map(c=>c.id);for(let j=scenarioDeck.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[scenarioDeck[j],scenarioDeck[k]]=[scenarioDeck[k],scenarioDeck[j]];}
 return {players,turn:0,round:1,roll:0,left:0,phase:online?'lobby':'cones',pending:null,pendingQuestion:null,questionDeadline:null,pendingScenario:null,pendingRoad:null,coneToMove:null,coneMovedThisTurn:false,scenarioDeck,scenarioDiscard:[],stock,stopMix:{...stopMix},log:[`Place two construction cones each, then collect ${total} stops and return to your assigned home base.`],winner:null,humans,online,rev:0};
}
export function hydrateGame(game:Game){
 game.players.forEach(player=>{player.homeBase??=homeBases[Math.floor(Math.random()*homeBases.length)];player.hand??=[];player.cones??=[];player.skipTurns??=0;player.extraTurns??=0;player.passCount??=0;player.electricRoad??=null;player.doubleTurn??=false;player.slowRoad??=null;});
 game.pendingQuestion??=game.pending===null?null:cards.find(c=>c.id===game.pending)?.questions[0]??null;
 game.questionDeadline??=game.phase==='question'?Date.now()+60000:null;game.pendingScenario??=null;game.pendingRoad??=null;game.coneToMove??=null;game.coneMovedThisTurn??=false;
 game.scenarioDeck??=shuffle(scenarioCards.map(c=>c.id));game.scenarioDiscard??=[];game.stopMix??={...defaultStopMix};
 return game;
}
export function startGame(g:Game){if(g.phase!=='lobby')throw Error('Game already started.');g.turn=0;g.phase='cones';log(g,'Drivers: place two construction cones each before the first roll.')}
export function neighbors(id:string){return edges.filter(e=>e.a===id||e.b===id).map(e=>({...e,to:e.a===id?e.b:e.a}));}
function log(g:Game,s:string){g.log=[s,...g.log].slice(0,40)}
function moveCost(g:Game,e:Edge){const p=g.players[g.turn];return (p.doubleTurn||p.electricRoad===e.road)?0.5:1}
function canPassCone(g:Game,e:Edge){return !isConstruction(g,e)||g.roll===5||g.players[g.turn].passCount>0}
export function allowed(g:Game){const p=g.players[g.turn];return g.phase==='move'&&g.left>0?neighbors(p.pos).filter(e=>(!p.road||p.road===e.road)&&g.left>=moveCost(g,e)&&canPassCone(g,e)&&!(p.slowRoad===e.road&&!isConstruction(g,e)&&g.players.some((other,i)=>i!==g.turn&&other.pos!==p.pos&&distanceOnRoad(p.pos,other.pos,e.road)<distanceOnRoad(p.pos,e.to,e.road)))):[];}
export function switchableRoads(g:Game){const p=g.players[g.turn];return g.phase==='move'&&g.left>0&&p.road?Array.from(new Set(neighbors(p.pos).map(e=>e.road).filter(r=>r!==p.road))):[];}
function shuffle<T>(items:T[]){for(let j=items.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[items[j],items[k]]=[items[k],items[j]];}return items}
function drawScenarioId(g:Game){if(!g.scenarioDeck.length){g.scenarioDeck=shuffle(g.scenarioDiscard.splice(0));}return g.scenarioDeck.shift()}
function discardScenario(g:Game,id:string){g.scenarioDiscard.push(id)}
export function changeRoad(g:Game,road:Road){
 if(g.phase!=='move'||g.left<1)throw Error('You need at least one movement point to change roads.');
 const p=g.players[g.turn];if(road===p.road)throw Error('You are already on that type of road.');
 if(!neighbors(p.pos).some(e=>e.road===road))throw Error('There is no road of that type at this junction.');
 if(!p.road){p.road=road;log(g,`${p.name} chose ${road} for the first road.`);return;}
 g.left--;const id=drawScenarioId(g);if(!id)throw Error('There are no scenario cards available.');
 p.road=road;if(p.electricRoad&&p.electricRoad!==road)p.electricRoad=null;g.pendingRoad=road;
 const card=scenarioCards.find(c=>c.id===id)!;log(g,`${p.name} changed to ${road} and drew “${card.title}.”`);
 if(card.type==='hold'){
  if(p.hand.length<3){p.hand.push(id);g.phase='move';g.pendingRoad=null;}
  else{g.pendingScenario=id;g.phase='hand';}
 }else{g.pendingScenario=id;g.phase='event';}
}
export function playChangeRoadCard(g:Game,id:string,road:Road){
 const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===id);
 if(g.phase!=='move'||!card||card.effect!=='switch-road'||!p.hand.includes(id))throw Error('Choose a held Change Road Card.');
 if(!neighbors(p.pos).some(e=>e.road===road)||road===p.road)throw Error('Choose a different road type at this junction.');
 p.hand.splice(p.hand.indexOf(id),1);discardScenario(g,id);p.road=road;if(p.electricRoad&&p.electricRoad!==road)p.electricRoad=null;log(g,`${p.name} played a Change Road Card and switched to ${road}.`);
}
export function playConstructionPass(g:Game,id:string){const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===id);if(g.phase!=='move'||!card||card.effect!=='construction-pass'||!p.hand.includes(id))throw Error('Choose a held Construction Pass.');p.hand.splice(p.hand.indexOf(id),1);discardScenario(g,id);p.passCount++;log(g,`${p.name} saved a Construction Pass for the next cone.`)}
export function discardHeldCard(g:Game,id:string){
 if(g.phase!=='hand'||!g.pendingScenario)throw Error('No hand limit choice is waiting.');
 const p=g.players[g.turn],incoming=g.pendingScenario;
 if(id===incoming){discardScenario(g,incoming);log(g,`${p.name} discarded the newly drawn hold card.`);}
 else{const index=p.hand.indexOf(id);if(index<0)throw Error('Choose a card from your hand.');p.hand.splice(index,1);discardScenario(g,id);p.hand.push(incoming);log(g,`${p.name} discarded a held card and kept the new one.`);}
 g.pendingScenario=null;g.pendingRoad=null;g.phase='move';
}
export function cancelScenario(g:Game,cardId:string){
 if(g.phase!=='event'||!g.pendingScenario)throw Error('There is no event to cancel.');
 const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===cardId);
 if(!card||card.effect!=='cancel-event'||!p.hand.includes(cardId))throw Error('Choose a held birthday or Christmas card.');
 p.hand.splice(p.hand.indexOf(cardId),1);discardScenario(g,cardId);discardScenario(g,g.pendingScenario);log(g,`${p.name} cancelled the event with ${card.title}.`);g.pendingScenario=null;g.pendingRoad=null;g.phase='move';
}
function startQuestion(g:Game,id:number){const card=cards.find(c=>c.id===id)!;g.pending=id;g.pendingQuestion=card.questions[Math.floor(Math.random()*card.questions.length)]||'Share one thing you know about this place.';g.questionDeadline=Date.now()+60000;g.phase='question';g.left=0;log(g,`${g.players[g.turn].name} reached ${spaces[g.players[g.turn].pos].name}. Trivia starts now: 60 seconds.`)}
function distanceOnRoad(from:string,to:string,road:Road){if(from===to)return 0;const queue:[string,number][]=[[from,0]],seen=new Set([from]);for(let i=0;i<queue.length;i++){const [id,n]=queue[i];for(const e of neighbors(id).filter(edge=>edge.road===road)){if(e.to===to)return n+1;if(!seen.has(e.to)){seen.add(e.to);queue.push([e.to,n+1]);}}}return Infinity}
function maybeQuestionAtCurrentSpace(g:Game){const p=g.players[g.turn],id=p.cards.find(cardId=>!p.visited.includes(cardId)&&destinations.find(d=>d.id===cardId)?.hub===p.pos);if(id!==undefined){startQuestion(g,id);return true}return false}
export function resolveScenario(g:Game,choice?:string){
 if(g.phase!=='event'||!g.pendingScenario)throw Error('There is no immediate scenario to resolve.');
 const id=g.pendingScenario,card=scenarioCards.find(c=>c.id===id)!;const p=g.players[g.turn];let ends=false,checkArrival=false;
 const left=(g.turn+1)%g.players.length,selected=choice?Number(choice):left;
 switch(card.effect as ScenarioEffect){
  case 'travel-friend':{const friend=card.friend==='left'?left:Number.isInteger(selected)&&selected!==g.turn?selected:left;p.pos=card.target!;g.players[friend].pos=card.target!;checkArrival=true;break;}
  case 'go-to':p.pos=card.target!;checkArrival=true;break;
  case 'all-to':{const target=card.target==='current'?p.pos:card.target!;g.players.forEach(player=>player.pos=target);checkArrival=true;break;}
  case 'home':p.pos=p.homeBase;ends=true;checkArrival=true;break;
  case 'schools':{const schools=destinations.filter(d=>d.type==='education').map(d=>d.hub);let assigned:string[]=[];try{const parsed=JSON.parse(choice||'') as unknown;if(Array.isArray(parsed)&&parsed.length===g.players.length&&parsed.every((hub):hub is string=>typeof hub==='string'&&schools.includes(hub))&&new Set(parsed).size===parsed.length)assigned=parsed;}catch{}if(!assigned.length)assigned=shuffle([...schools]).slice(0,g.players.length);g.players.forEach((player,i)=>player.pos=assigned[i]);checkArrival=true;break;}
  case 'ski':{const resorts=['park','destination-17','logan','cedar'];p.pos=resorts.includes(choice||'')?choice!:resorts[Math.floor(Math.random()*resorts.length)];checkArrival=true;break;}
  case 'end-turn':ends=true;break;
  case 'skip-two':p.skipTurns+=2;ends=true;break;
  case 'add-two':g.left+=2;break;
  case 'snowstorm':g.left=Math.ceil(g.left/2);break;
  case 'speeding-ticket':{const held=choice&&p.hand.includes(choice)?choice:p.hand[0];if(held){p.hand.splice(p.hand.indexOf(held),1);discardScenario(g,held);}break;}
  case 'move-cone':{const all=g.players.flatMap((owner,ownerIndex)=>owner.cones.map(key=>({owner,ownerIndex,key})));if(all.length){const moved=all[Math.floor(Math.random()*all.length)],open=edges.filter(e=>!isConstruction(g,e));if(open.length){const edge=open[Math.floor(Math.random()*open.length)],key=edgeKey(edge.a,edge.b);moved.owner.cones[moved.owner.cones.indexOf(moved.key)]=key;}}break;}
  case 'business-trip':{const destination=p.cards.find(cardId=>!p.visited.includes(cardId));if(destination){const colleague=Number.isInteger(selected)&&selected!==g.turn?selected:left;g.players[colleague].pos=destinations.find(d=>d.id===destination)!.hub;g.pendingScenario=null;discardScenario(g,id);g.pendingRoad=null;startQuestion(g,destination);return;}break;}
  case 'slow-driver':p.slowRoad=g.pendingRoad??p.road;break;
  case 'stay-put':ends=true;break;
  case 'extra-turn':p.extraTurns++;break;
  case 'electric-car':p.electricRoad=p.road;break;
  case 'new-car':p.doubleTurn=true;break;
  default:break;
 }
 discardScenario(g,id);g.pendingScenario=null;g.pendingRoad=null;
 if(checkArrival&&maybeQuestionAtCurrentSpace(g))return;
 if(ends){log(g,`${p.name} ends the turn because of ${card.title}.`);endTurn(g);return;}
 g.phase='move';
}
export function nearbyCones(g:Game){const pos=g.players[g.turn].pos;return edges.filter(e=>isConstruction(g,e)&&(e.a===pos||e.b===pos)).map(e=>edgeKey(e.a,e.b));}
export function beginConeMove(g:Game,key:string){
 if(g.phase!=='move'||g.roll!==6)throw Error('Roll a six during your turn to move a cone.');
 if(g.coneMovedThisTurn)throw Error('You can move only one cone per turn.');
 if(!nearbyCones(g).includes(key))throw Error('You can only move a cone on a road segment beside your car.');
 g.coneToMove=key;g.phase='relocate';
}
export function relocateCone(g:Game,key:string){
 if(g.phase!=='relocate'||!g.coneToMove)throw Error('Choose a cone to move first.');
 const edge=edges.find(e=>edgeKey(e.a,e.b)===key);
 if(!edge)throw Error('Choose a road segment on the map.');
 if(g.players.some(driver=>driver.cones.includes(key)))throw Error('That road segment already has a cone.');
 const owner=g.players.find(driver=>driver.cones.includes(g.coneToMove!));
 if(!owner)throw Error('That cone is no longer on the road.');
 owner.cones[owner.cones.indexOf(g.coneToMove)]=key;
 log(g,`${g.players[g.turn].name} moved a construction cone to a new road segment.`);
 g.coneToMove=null;g.coneMovedThisTurn=true;g.phase='move';
}
export function placeCone(g:Game,key:string){
 if(g.phase!=='cones')throw Error('Cone placement is over.');
 const p=g.players[g.turn],edge=edges.find(e=>edgeKey(e.a,e.b)===key);
 if(!edge)throw Error('Choose a road segment on the map.');
 if(p.cones.length>=2)throw Error('You already placed both cones.');
 if(g.players.some(driver=>driver.cones.includes(key)))throw Error('A cone is already on that road segment.');
 p.cones.push(key);log(g,`${p.name} placed construction cone ${p.cones.length} of 2.`);
 if(p.cones.length<2)return;
 const next=Array.from({length:g.players.length-1},(_,i)=>(g.turn+i+1)%g.players.length).find(i=>g.players[i].cones.length<2);
 if(next!==undefined){g.turn=next;return;}
 g.turn=0;g.round=1;g.phase='roll';log(g,'All cones are placed. The road trip begins!');
}
export function endTurn(g:Game){
 const current=g.players[g.turn];g.left=0;current.doubleTurn=false;
 if(current.extraTurns>0){current.extraTurns--;g.phase='roll';return;}
 for(let tries=0;tries<g.players.length;tries++){
  g.turn=(g.turn+1)%g.players.length;if(g.turn===0)g.round++;
  const next=g.players[g.turn];if(next.skipTurns>0){next.skipTurns--;log(g,`${next.name} loses a turn to a scenario card.`);continue;}
  g.phase='roll';return;
 }
 g.phase='roll';
}
export function roll(g:Game,value=die()){
 if(g.phase!=='roll')throw Error('Finish the current turn first.');if(!Number.isInteger(value)||value<1||value>6)throw Error('Invalid die.');
 g.roll=value;g.left=value;g.coneMovedThisTurn=false;g.phase='move';log(g,`${g.players[g.turn].name} rolled ${value}.`);
 if(!allowed(g).length&&!switchableRoads(g).length&&!(value===6&&nearbyCones(g).length)){log(g,'No open road: wait for another roll or take a different route next turn.');endTurn(g);}
}
export function move(g:Game,to:string){
 const e=allowed(g).find(e=>e.to===to);if(!e)throw Error('That space is not available on this roll.');
 const p=g.players[g.turn],cost=moveCost(g,e);if(isConstruction(g,e)&&g.roll!==5)p.passCount--;p.pos=to;p.road=e.road;g.left=Math.max(0,g.left-cost);
 const destination=p.cards.find(id=>!p.visited.includes(id)&&destinations.find(d=>d.id===id)?.hub===to);
 if(destination){startQuestion(g,destination);return;}
 if(to===p.homeBase&&p.visited.length===p.cards.length){g.phase='won';g.winner=g.turn;log(g,`${p.name} reached home and wins the Tour of Utah!`);return;}
 if(g.left<=0||(!allowed(g).length&&!switchableRoads(g).length))endTurn(g);
}
export function answer(g:Game,correct:boolean){
 if(g.phase!=='question'||g.pending===null)throw Error('No destination question is waiting.');
 const p=g.players[g.turn],id=g.pending;if(g.questionDeadline!==null&&Date.now()>=g.questionDeadline)correct=false;
 if(correct){p.visited.push(id);log(g,`${p.name} answered correctly and collected ${spaces[p.pos].name}!`);}
 else{const index=p.cards.indexOf(id),oldType=destinations.find(d=>d.id===id)?.type;p.cards.splice(index,1);if(g.stock.length){let replacement=g.stock.findIndex(next=>destinations.find(d=>d.id===next)?.type===oldType);if(replacement<0)replacement=0;p.cards.push(g.stock.splice(replacement,1)[0]);}log(g,`${p.name} missed the question${g.stock.length||g.stock.length===0&&p.cards.length?'; draw a new destination.':' and there are no destinations left in the draw pile.'}`);}
 g.pending=null;g.pendingQuestion=null;g.questionDeadline=null;
 if(p.pos===p.homeBase&&p.visited.length===p.cards.length&&p.cards.length){g.phase='won';g.winner=g.turn;log(g,`${p.name} reached home and wins the Tour of Utah!`);return;}
 endTurn(g);
}
function distance(from:string,target:string){const queue:[string,number][]=[[from,0]];const seen=new Set([from]);for(let i=0;i<queue.length;i++){let [id,n]=queue[i];if(id===target)return n;for(const e of neighbors(id))if(!seen.has(e.to)){seen.add(e.to);queue.push([e.to,n+1]);}}return Infinity;}
export function botTurn(g:Game){
 if(!g.players[g.turn].bot||g.phase==='lobby'||g.phase==='won')return;
 if(g.phase==='cones'){
  while(g.players[g.turn].bot&&g.phase==='cones'){
   const used=new Set(g.players.flatMap(player=>player.cones));const open=edges.filter(e=>!used.has(edgeKey(e.a,e.b)));
   if(!open.length)throw Error('No open road segments remain for cone placement.');
   const e=open[Math.floor(Math.random()*open.length)];placeCone(g,edgeKey(e.a,e.b));
  }
  return;
 }
 if(g.phase==='event'){resolveScenario(g);return;}
 if(g.phase==='hand'){const incoming=g.pendingScenario;if(incoming)discardHeldCard(g,g.players[g.turn].hand[0]??incoming);return;}
 if(g.phase==='relocate'){const open=edges.find(e=>!isConstruction(g,e));if(open)relocateCone(g,edgeKey(open.a,open.b));return;}
 if(g.phase==='question'){answer(g,true);return;}
 const turn=g.turn;const p=g.players[turn];const targets=p.cards.filter(id=>!p.visited.includes(id)).map(id=>destinations.find(d=>d.id===id)!.hub);if(!targets.length)targets.push(p.homeBase);
 const target=targets.sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0];if(g.phase==='roll')roll(g);
 let steps=0;while(g.turn===turn&&g.phase==='move'&&steps++<6){
  const options=allowed(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target));
  if(!options.length&&g.roll===6&&!g.coneMovedThisTurn&&nearbyCones(g).length){const key=nearbyCones(g)[0],open=edges.filter(e=>!isConstruction(g,e));if(open.length){beginConeMove(g,key);relocateCone(g,edgeKey(open[0].a,open[0].b));continue;}}
  if(!options.length&&switchableRoads(g).length){const road=switchableRoads(g).sort((a,b)=>Math.min(...neighbors(p.pos).filter(e=>e.road===a).map(e=>distance(e.to,target)))-Math.min(...neighbors(p.pos).filter(e=>e.road===b).map(e=>distance(e.to,target))))[0];changeRoad(g,road);if(g.phase!=='move')break;continue;}
  if(!options.length||distance(options[0].to,target)>=distance(p.pos,target)){endTurn(g);break;}move(g,options[0].to);
 }
}
