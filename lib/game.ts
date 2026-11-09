export type Road = 'Freeway' | 'Highway' | 'State road';
export const colors = ['#d85535','#277a96','#d49a23','#7b5da5','#329568','#d25c8e','#4a64c1','#745343'];
export const hubs = [
 ['slc','Salt Lake City',300,238],['ogden','Ogden',292,156],['logan','Logan',345,82],['bear','Bear Lake',421,57],
 ['wendover','Salt Flats',85,240],['park','Park City',389,258],['heber','Heber City',407,319],['vernal','Vernal',625,285],
 ['provo','Provo',331,355],['nephi','Nephi',298,438],['delta','Delta',194,484],['price','Price',469,431],
 ['green','Green River',565,522],['moab','Moab',639,592],['arches','Arches',665,552],['canyon','Canyonlands',582,615],
 ['richfield','Richfield',318,552],['reef','Capitol Reef',432,632],['bryce','Bryce Canyon',335,720],['cedar','Cedar City',224,698],
 ['zion','Zion',242,788],['george','St. George',156,823],['kanab','Kanab',329,831],['monument','Monument Valley',600,841],
 ['blanding','Blanding',638,738],['goblin','Goblin Valley',508,584],['flaming','Flaming Gorge',601,182],['evanston','Evanston, WY',470,191],
] as const;
export type Space={id:string;name:string;x:number;y:number;hub:boolean};
export type Edge={a:string;b:string;road:Road;barrel:boolean};
export const spaces: Record<string,Space> = Object.fromEntries(hubs.map(([id,name,x,y])=>[id,{id,name,x,y,hub:true}]));
export const edges:Edge[]=[];
const routes:[string,string,Road,number,boolean?][]=[
 ['slc','ogden','Freeway',4],['ogden','logan','Highway',4],['logan','bear','Highway',4],['slc','wendover','Freeway',8,true],
 ['slc','park','Freeway',4],['park','evanston','Freeway',4],['park','heber','Highway',3],['heber','vernal','Highway',8,true],
 ['vernal','flaming','Highway',4],['slc','provo','Freeway',5],['provo','heber','Highway',4],['provo','nephi','Freeway',4],
 ['nephi','delta','Highway',4],['delta','richfield','Highway',5],['nephi','richfield','Freeway',5],['provo','price','Highway',6,true],
 ['price','green','Highway',5],['richfield','green','Freeway',9],['green','moab','Highway',4],['moab','arches','State road',2],
 ['moab','canyon','State road',3,true],['moab','blanding','Highway',6],['blanding','monument','Highway',4],['richfield','reef','State road',5],
 ['reef','goblin','State road',4],['goblin','green','State road',3],['reef','bryce','State road',6,true],['richfield','cedar','Freeway',7],
 ['cedar','george','Freeway',5],['cedar','bryce','State road',5],['bryce','kanab','Highway',5],['kanab','zion','State road',4],
 ['zion','george','State road',4,true],['kanab','monument','Highway',10]
];
for (const [a,b,road,count,barrel] of routes) {
 let prev=a; for(let i=1;i<=count;i++) {const id=i===count?b:`${a}-${b}-${i}`;if(i<count)spaces[id]={id,name:`${spaces[a].name}–${spaces[b].name} · ${i}/${count}`,x:spaces[a].x+(spaces[b].x-spaces[a].x)*i/count,y:spaces[a].y+(spaces[b].y-spaces[a].y)*i/count,hub:false};edges.push({a:prev,b:id,road,barrel:!!barrel&&i===Math.ceil(count/2)});prev=id;}
}
export const destinations=[{id:3,hub:'wendover'},{id:9,hub:'park'},{id:10,hub:'bear'},{id:7,hub:'heber'},{id:35,hub:'arches'},{id:36,hub:'bryce'},{id:37,hub:'canyon'},{id:38,hub:'reef'},{id:47,hub:'flaming'},{id:48,hub:'monument'},{id:59,hub:'kanab'},{id:61,hub:'vernal'},{id:69,hub:'goblin'},{id:73,hub:'logan'},{id:79,hub:'cedar'},{id:80,hub:'george'}];
export type Player={name:string;bot:boolean;pos:string;road:Road|null;cards:number[];visited:number[];token?:string};
export type Game={players:Player[];turn:number;round:number;roll:number;left:number;phase:'lobby'|'roll'|'move'|'question'|'won';pending:number|null;stock:number[];log:string[];winner:number|null;humans:number;online:boolean;host?:string;rev:number};
export function die(){return 1+Math.floor(Math.random()*6)}
export function createGame(humans:number,bots:number,name='You',online=false):Game{
 if(!Number.isInteger(humans)||!Number.isInteger(bots)||humans<1||bots<0||humans+bots>8)throw Error('Choose 1–8 players with at least one human.');
 const deck=[...destinations];for(let j=deck.length-1;j>0;j--){let k=Math.floor(Math.random()*(j+1));[deck[j],deck[k]]=[deck[k],deck[j]];}
 const perPlayer=Math.min(3,Math.floor(deck.length/(humans+bots)));const players:Player[]=[];
 for(let i=0;i<humans+bots;i++)players.push({name:i===0?name:i<humans?`Driver ${i+1}`:`Computer ${i-humans+1}`,bot:i>=humans,pos:'slc',road:null,cards:deck.splice(0,perPlayer).map(d=>d.id),visited:[]});
 return {players,turn:0,round:1,roll:0,left:0,phase:online?'lobby':'roll',pending:null,stock:deck.map(d=>d.id),log:[`Visit ${perPlayer} unique destinations, then return to Salt Lake City.`],winner:null,humans,online,rev:0};
}
export function neighbors(id:string){return edges.filter(e=>e.a===id||e.b===id).map(e=>({...e,to:e.a===id?e.b:e.a}));}
export function allowed(g:Game){const p=g.players[g.turn];return g.phase==='move'&&g.left>0?neighbors(p.pos).filter(e=>(!p.road||p.road===e.road||g.roll===6)&&(!e.barrel||g.roll>=4)):[];}
function log(g:Game,s:string){g.log=[s,...g.log].slice(0,40)}
export function endTurn(g:Game){g.left=0;g.turn=(g.turn+1)%g.players.length;if(g.turn===0)g.round++;g.phase='roll';}
export function roll(g:Game,value=die()){
 if(g.phase!=='roll')throw Error('Finish the current turn first.');if(!Number.isInteger(value)||value<1||value>6)throw Error('Invalid die.');
 g.roll=value;g.left=value;g.phase='move';log(g,`${g.players[g.turn].name} rolled ${value}.`);
 if(!allowed(g).length){log(g,'No open road: wait for another roll or take a different route next turn.');endTurn(g);}
}
export function move(g:Game,to:string){
 const e=allowed(g).find(e=>e.to===to);if(!e)throw Error('That space is not available on this roll.');
 const p=g.players[g.turn];p.pos=to;p.road=e.road;g.left--;
 const destination=p.cards.find(id=>!p.visited.includes(id)&&destinations.find(d=>d.id===id)?.hub===to);
 if(destination){g.pending=destination;g.phase='question';g.left=0;log(g,`${p.name} reached ${spaces[to].name}. Answer its trivia question to collect the stamp.`);return;}
 if(to==='slc'&&p.visited.length===p.cards.length){g.phase='won';g.winner=g.turn;log(g,`${p.name} wins the Tour of Utah!`);return;}
 if(!g.left||!allowed(g).length)endTurn(g);
}
export function answer(g:Game,correct:boolean){
 if(g.phase!=='question'||g.pending===null)throw Error('No destination question is waiting.');
 const p=g.players[g.turn],id=g.pending;
 if(correct){p.visited.push(id);log(g,`${p.name} answered correctly and collected ${spaces[p.pos].name}!`);}
 else{const index=p.cards.indexOf(id);p.cards.splice(index,1);if(g.stock.length)p.cards.push(g.stock.shift()!);log(g,`${p.name} missed the question${g.stock.length||g.stock.length===0&&p.cards.length?'; draw a new destination.':' and there are no destinations left in the draw pile.'}`);}
 g.pending=null;
 if(p.pos==='slc'&&p.visited.length===p.cards.length&&p.cards.length){g.phase='won';g.winner=g.turn;log(g,`${p.name} wins the Tour of Utah!`);return;}
 if(p.visited.length===p.cards.length&&p.cards.length){g.phase='roll';return;}
 g.phase='roll';
}
function distance(from:string,target:string){const queue:[string,number][]=[[from,0]];const seen=new Set([from]);for(let i=0;i<queue.length;i++){let [id,n]=queue[i];if(id===target)return n;for(const e of neighbors(id))if(!seen.has(e.to)){seen.add(e.to);queue.push([e.to,n+1]);}}return Infinity;}
export function botTurn(g:Game){
 if(!g.players[g.turn].bot||g.phase==='lobby'||g.phase==='won')return;
 if(g.phase==='question'){answer(g,true);return;}
 const turn=g.turn;const p=g.players[turn];const targets=p.cards.filter(id=>!p.visited.includes(id)).map(id=>destinations.find(d=>d.id===id)!.hub);if(!targets.length)targets.push('slc');
 const target=targets.sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0];if(g.phase==='roll')roll(g);
 let steps=0;while(g.turn===turn&&g.phase==='move'&&steps++<6){
  const options=allowed(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target));
  if(!options.length||distance(options[0].to,target)>=distance(p.pos,target)){endTurn(g);break;}move(g,options[0].to);
 }
}
