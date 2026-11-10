import cards from './cards.json';
import {scenarioCards,type ScenarioEffect} from './scenarios';
import roadMap from './road-map-data.json';
export type Road = 'Freeway' | 'Highway' | 'State road' | 'County road';
export type StopType='easy'|'hard'|'education';
export type StopMix=Record<StopType,number>;
export const defaultStopMix:StopMix={easy:2,hard:1,education:0};
export const colors = ['#d85535','#277a96','#d49a23','#7b5da5','#329568','#d25c8e','#4a64c1','#745343'];
// Hubs are plotted from real-world coordinates and the road network is bundled locally.
const sourceHubs = [
 ['salt-lake-city','Salt Lake City',347,263],['ogden','Ogden',376,171],['logan','Logan',416,89],['bear-lake','Bear Lake',475,40],
 ['west-wendover','West Wendover, NV',37,285],['park-city','Park City',458,322],['heber-city','Heber City',519,346],['vernal','Vernal',796,254],
 ['provo','Provo',443,414],['nephi','Nephi',405,550],['delta','Delta',274,614],['price','Price',573,549],
 ['green-river','Green River',703,665],['moab','Moab',795,769],['arches','Arches National Park',819,747],['canyonlands','Canyonlands',712,790],
 ['richfield','Richfield',401,714],['torrey','Torrey',472,800],['bryce-canyon','Bryce Canyon',361,947],['cedar-city','Cedar City',231,973],
 ['zion','Springdale / Zion',143,1039],['st-george','St. George',168,1077],['kanab','Kanab',342,1046],['monument-valley','Monument Valley',781,1030],
 ['blanding','Blanding',751,970],['goblin-valley','Goblin Valley',599,698],['flaming-gorge','Flaming Gorge',683,168],['evanston','Evanston, WY',558,166],
 ['fillmore','Fillmore',340,819],['bluff','Bluff',748,1022],
 ['brigham-city','Brigham City',374,142],['tremonton','Tremonton',358,91],['i84-idaho-border','I-84 · Idaho line',334,24],['boise','Boise, ID',124,185],['malad-city','Malad City, ID',385,66],['pocatello','Pocatello, ID',400,116],['preston','Preston, ID',355,55],['garden-city','Garden City',425,96],
 ['coalville','Coalville',517,257],['echo','Echo',503,232],['rock-springs','Rock Springs, WY',827,167],['tooele','Tooele',261,329],
 ['grantsville','Grantsville',236,349],['farmington','Farmington',364,220],['kaysville','Kaysville',373,205],['layton','Layton',377,190],
 ['antelope-island','Antelope Island',305,205],['slc-airport','Salt Lake City Airport',340,239],['sandy','Sandy',352,295],['draper','Draper',359,315],
 ['lehi','Lehi',385,350],['orem','Orem',433,390],['spanish-fork','Spanish Fork',438,438],['payson','Payson',418,470],['yuba-i15-exit','Yuba Park · I-15 Exit 202',324,577],
 ['scipio','Scipio',342,620],['salina','Salina',415,678],['ephraim','Ephraim',393,640],['manti','Manti',404,658],['thistle','Thistle Junction',454,485],
 ['cove-fort','Cove Fort',289,754],['beaver','Beaver',269,840],['milford','Milford',204,811],['parowan','Parowan',230,927],
 ['panguitch','Panguitch',305,919],['escalante','Escalante',434,917],['boulder','Boulder',462,888],['hanksville','Hanksville',525,789],
 ['loa','Loa',434,778],['cisco','Cisco',847,684],['monticello','Monticello',782,988],['cortez','Cortez, CO',858,1024],
 ['page','Page, AZ',691,1069],['grand-canyon','Grand Canyon North Rim, AZ',488,1040],['grand-canyon-south-rim','Grand Canyon South Rim, AZ',495,1080],['jacob-lake','Jacob Lake, AZ',468,967],['baker','Baker, NV',89,1030],['ely','Ely, NV',102,712],
 ['mesquite','Mesquite, NV',127,1081],['hurricane','Hurricane',154,1056],['enterprise','Enterprise',105,1025],
 ['fairfield','Fairfield',303,376],['goshen','Goshen',350,453],['vernon','Vernon',275,491],['dugway','Dugway',191,423],['jericho','Jericho',322,557],
 ['scofield','Scofield',472,565],['duchesne','Duchesne',621,444],['roosevelt','Roosevelt',684,385],['myton','Myton',646,418],
 ['dinosaur','Dinosaur, CO',839,291],['mountain-view','Mountain View, WY',643,199],['manila','Manila',643,219],['dutch-john','Dutch John',798,250],
 ['halls-crossing','Halls Crossing',561,987],['natural-bridges','Natural Bridges',722,991],
 ['four-corners','Four Corners',794,1071],['kayenta','Kayenta, AZ',819,1082],
 ['cannonville','Cannonville',337,933],['circleville','Circleville',287,875],
 ['simpson-springs','Simpson Springs',229,430],['topaz-mountain','Topaz Mountain',263,681],
 ['soldier-hollow','Soldier Hollow',508,372],['mirror-lake','Mirror Lake Highway',553,307],['snowbird','Snowbird',373,299],['living-planet-aquarium','Living Planet Aquarium',359,310],
 ['cherry-hill','Cherry Hill',371,190],['golden-spike','Golden Spike',303,123],['dinosaur-nm','Dinosaur National Monument',807,269],['little-sahara','Little Sahara',291,579],
 ['nine-mile-canyon','Nine Mile Canyon',622,513],['fremont-indian','Fremont Indian State Park',375,725],['meadow','Meadow',298,863],['cedar-breaks','Cedar Breaks',228,946],
 ['mountain-meadows','Mountain Meadows',136,1015],['snow-canyon','Snow Canyon',138,1060],['coral-pink-sand-dunes','Coral Pink Sand Dunes',313,1040],
 ['the-wave','The Wave',343,1058],['coyote-gulch','Coyote Gulch',424,953],['hole-in-rock','Hole in the Rock',578,956],['dark-canyon','Dark Canyon',700,951],
 ['edge-of-cedars','Edge of the Cedars',766,989],['newspaper-rock','Newspaper Rock',735,975],['valley-of-the-gods','Valley of the Gods',777,1011],['goosenecks','Goosenecks',728,1041],
 ['navajo-mountain','Navajo Mountain',638,1036],['glen-canyon-dam','Glen Canyon Dam',681,1054],['usu','Utah State University',433,74],['uofu','University of Utah',364,231],
 ['weber-state','Weber State University',391,155],['uvu','Utah Valley University',447,385],['byu','Brigham Young University',459,416],['snow-college','Snow College',406,660],
 ['suu','Southern Utah University',248,982],['utah-tech','Utah Tech University',184,1086],
 ['hill-aerospace-museum','Hill Aerospace Museum',405,148],['lagoon','Lagoon',355,204],['hogle-zoo','Hogle Zoo',350,299],['timpanogos-cave','Timpanogos Cave',407,365],
 ['bingham-canyon-mine','Bingham Canyon Mine',296,316],['temple-square','Temple Square',331,251],['this-is-the-place','This Is the Place Heritage Park',371,280],['camp-floyd','Camp Floyd',315,388],
 ['scofield-reservoir','Scofield Reservoir',466,557],['goshen-movie-set','Goshen Movie Set',346,463],['spiral-jetty','Spiral Jetty',239,181],['mount-timpanogos','Mount Timpanogos',421,350],
 ['starvation-reservoir','Starvation Reservoir',650,435],['lava-hot-springs','Lava Hot Springs, ID',390,37],['yuba-state-park','Yuba State Park',320,526],['meadow-lava-tubes','Meadow Lava Tubes',289,866],
 ['capitol-reef','Capitol Reef National Park',453,806],['mesa-verde','Mesa Verde National Park, CO',875,1037],['great-basin','Great Basin National Park, NV',114,1005],
 ['bears-ears','Bears Ears National Monument',719,954],['grand-staircase','Grand Staircase–Escalante',392,938],['fort-kanab','Fort Kanab',357,1056],
 ['rainbow-bridge','Rainbow Bridge National Monument',612,1058],['hovenweep','Hovenweep National Monument',812,1010],['san-rafael-swell','San Rafael Swell',499,658],
 ['wilberg-mine','Wilberg Mine',470,652],['dead-horse-point','Dead Horse Point',777,757],['utah-fairgrounds','Utah State Fairgrounds',343,266],
 ['bonneville-salt-flats','Bonneville Salt Flats',96,278],['utah-olympic-park','Utah Olympic Park',458,310],['heber-valley-railroad','Heber Valley Railroad',528,354],
] as const;
const mapPoints = Object.values(roadMap.locations) as [number,number][];
const mapLongitudes = mapPoints.map(([longitude])=>longitude);
const projectLatitudes = mapPoints.map(([,latitude])=>Math.log(Math.tan(Math.PI/4+latitude*Math.PI/360)));
const longitudeMin = Math.min(...mapLongitudes), longitudeMax = Math.max(...mapLongitudes);
const mercatorMin = Math.min(...projectLatitudes), mercatorMax = Math.max(...projectLatitudes);
export function projectRoadPoint([longitude,latitude]:[number,number]){
 const mercatorY=Math.log(Math.tan(Math.PI/4+latitude*Math.PI/360));
 return {x:18+(longitude-longitudeMin)/(longitudeMax-longitudeMin)*884,y:18+(mercatorMax-mercatorY)/(mercatorMax-mercatorMin)*1010};
}
export const hubs=sourceHubs.map(([id,name,oldX,oldY])=>{const point=(roadMap.locations as Record<string,[number,number]>)[id];const projected=point?projectRoadPoint(point):{x:oldX,y:oldY};return [id,name,projected.x,projected.y] as const;});
const boundaryData=(roadMap as unknown as {stateBoundaries:{name:string;rings:[number,number][][]}[]}).stateBoundaries;
export const stateBoundaryShapes=boundaryData.map(state=>({name:state.name,rings:state.rings.map(ring=>ring.map(point=>projectRoadPoint(point)))}));
export const stateLabels=[['NEVADA',[-114.35,39.55]],['IDAHO',[-112.15,42.3]],['WYOMING',[-109.55,41.65]],['COLORADO',[-108.48,38.85]],['ARIZONA',[-111.15,36.12]],['UTAH',[-111.5,39.6]]].map(([name,point])=>({name:name as string, ...projectRoadPoint(point as [number,number])}));
export type Space={id:string;name:string;x:number;y:number;hub:boolean};
export type Edge={a:string;b:string;road:Road;barrel:boolean};
export const spaces: Record<string,Space> = Object.fromEntries(hubs.map(([id,name,x,y])=>[id,{id,name,x,y,hub:true}]));
export const edges:Edge[]=[];
const routeDefinitions:[string,string,Road][]=[
 // Interstates and interstate connectors
 ['st-george','mesquite','Freeway'],['st-george','cedar-city','Freeway'],['cedar-city','beaver','Freeway'],['beaver','fillmore','Freeway'],['fillmore','nephi','Freeway'],['nephi','payson','Freeway'],['payson','spanish-fork','Freeway'],['spanish-fork','provo','Freeway'],['provo','orem','Freeway'],['orem','lehi','Freeway'],['lehi','draper','Freeway'],['draper','sandy','Freeway'],['sandy','salt-lake-city','Freeway'],['salt-lake-city','farmington','Freeway'],['farmington','kaysville','Freeway'],['kaysville','layton','Freeway'],['layton','ogden','Freeway'],['ogden','brigham-city','Freeway'],['brigham-city','tremonton','Freeway'],['tremonton','i84-idaho-border','Freeway'],['i84-idaho-border','boise','Freeway'],['tremonton','malad-city','Freeway'],['malad-city','pocatello','Freeway'],['tremonton','preston','Highway'],
 ['salt-lake-city','tooele','Freeway'],['salt-lake-city','grantsville','Freeway'],['tooele','grantsville','Highway'],['grantsville','west-wendover','Freeway'],['salt-lake-city','echo','Freeway'],['ogden','echo','Freeway'],['echo','coalville','Freeway'],['coalville','evanston','Freeway'],['evanston','rock-springs','Freeway'],
 ['cove-fort','salina','Freeway'],['salina','green-river','Freeway'],['green-river','cisco','Freeway'],
 // US highways
 ['salt-lake-city','spanish-fork','Highway'],['spanish-fork','nephi','Highway'],['nephi','salina','Highway'],['nephi','manti','State road'],['salina','richfield','Highway'],
 ['spanish-fork','price','Highway'],['price','green-river','Highway'],['cisco','moab','Highway'],['moab','monticello','Highway'],['monticello','blanding','Highway'],['blanding','bluff','Highway'],['bluff','kayenta','Highway'],['page','kayenta','Highway'],
 ['park-city','heber-city','Highway'],['heber-city','duchesne','Highway'],['duchesne','roosevelt','Highway'],['roosevelt','vernal','Highway'],['vernal','dinosaur','Highway'],
 ['logan','garden-city','Highway'],['garden-city','preston','Highway'],['ogden','logan','Highway'],['ephraim','thistle','Highway'],
 ['ely','delta','Highway'],['delta','scipio','Highway'],['scipio','salina','Highway'],
 ['kanab','page','Highway'],['zion','kanab','Highway'],['panguitch','kanab','Highway'],['page','grand-canyon-south-rim','Highway'],['kanab','jacob-lake','Highway'],['jacob-lake','grand-canyon','Highway'],['monticello','cortez','Highway'],['cortez','four-corners','Highway'],['four-corners','kayenta','Highway'],
 // Scenic state highways and county roads
 ['ogden','park-city','State road'],['park-city','salt-lake-city','State road'],['nephi','delta','State road'],['delta','milford','State road'],['milford','baker','State road'],['richfield','cove-fort','State road'],
 ['richfield','loa','State road'],['loa','torrey','State road'],['torrey','hanksville','State road'],['hanksville','green-river','State road'],['torrey','boulder','State road'],['boulder','escalante','State road'],['escalante','cannonville','State road'],['cannonville','bryce-canyon','State road'],['bryce-canyon','panguitch','State road'],['panguitch','circleville','State road'],['panguitch','parowan','State road'],['parowan','cedar-city','State road'],
 ['hanksville','natural-bridges','State road'],['natural-bridges','blanding','State road'],['bluff','monument-valley','State road'],['monument-valley','kayenta','State road'],['moab','arches','State road'],['moab','canyonlands','State road'],['green-river','goblin-valley','State road'],['price','scofield','State road'],['price','duchesne','State road'],['vernal','flaming-gorge','State road'],['flaming-gorge','manila','State road'],['manila','dutch-john','State road'],['dutch-john','mountain-view','County road'],
 ['west-wendover','bonneville-salt-flats','County road'],['logan','bear-lake','County road'],['park-city','utah-olympic-park','County road'],['heber-city','heber-valley-railroad','County road'],['salt-lake-city','utah-fairgrounds','County road'],['spanish-fork','camp-floyd','County road'],['natural-bridges','halls-crossing','State road'],
 ['salt-lake-city','antelope-island','County road'],['salt-lake-city','slc-airport','County road'],['tooele','dugway','State road'],['vernon','simpson-springs','County road'],['goshen','vernon','County road'],['camp-floyd','vernon','State road'],['delta','topaz-mountain','County road'],['nephi','jericho','County road'],['nephi','goshen','County road'],['spanish-fork','fairfield','County road'],['park-city','soldier-hollow','County road'],['heber-city','soldier-hollow','County road'],['heber-city','mirror-lake','County road'],
 ['salt-lake-city','snowbird','County road'],['sandy','living-planet-aquarium','County road'],['farmington','lagoon','County road'],['ogden','hill-aerospace-museum','County road'],['salt-lake-city','hogle-zoo','County road'],['salt-lake-city','temple-square','County road'],['salt-lake-city','this-is-the-place','County road'],['ogden','weber-state','County road'],['salt-lake-city','uofu','County road'],['provo','byu','County road'],['orem','uvu','County road'],['logan','usu','County road'],['ephraim','snow-college','County road'],['cedar-city','suu','County road'],['st-george','utah-tech','County road'],['spanish-fork','timpanogos-cave','County road'],['spanish-fork','mount-timpanogos','County road'],['salt-lake-city','bingham-canyon-mine','County road'],['tooele','spiral-jetty','County road'],['roosevelt','starvation-reservoir','County road'],['preston','lava-hot-springs','County road'],['nephi','yuba-i15-exit','Freeway'],['yuba-i15-exit','yuba-state-park','County road'],['yuba-state-park','salina','State road'],['fillmore','meadow','County road'],['salina','meadow-lava-tubes','County road'],['richfield','fremont-indian','County road'],['torrey','capitol-reef','County road'],['cortez','mesa-verde','County road'],['baker','great-basin','State road'],['monticello','bears-ears','County road'],['escalante','grand-staircase','County road'],['kanab','fort-kanab','County road'],['natural-bridges','rainbow-bridge','County road'],['blanding','hovenweep','County road'],['green-river','san-rafael-swell','County road'],['ephraim','wilberg-mine','County road'],['price','wilberg-mine','State road'],['moab','dead-horse-point','County road'],['blanding','edge-of-cedars','County road'],['blanding','newspaper-rock','County road'],['page','glen-canyon-dam','County road'],['cedar-city','enterprise','State road'],['enterprise','mountain-meadows','State road'],['st-george','hurricane','State road'],['salina','ephraim','Highway'],['price','scofield-reservoir','County road'],['goshen','goshen-movie-set','County road'],['farmington','cherry-hill','County road'],['tremonton','golden-spike','County road'],['price','nine-mile-canyon','County road'],['nephi','little-sahara','County road'],['parowan','cedar-breaks','County road'],['coyote-gulch','hole-in-rock','County road'],['kanab','the-wave','County road'],['hurricane','zion','State road'],['st-george','snow-canyon','County road'],['escalante','coyote-gulch','County road'],['blanding','dark-canyon','County road'],['bluff','valley-of-the-gods','County road'],['bluff','navajo-mountain','County road'],['bluff','goosenecks','County road'],['kanab','coral-pink-sand-dunes','County road'],['vernal','dinosaur-nm','County road'],['myton','duchesne','County road'],['ephraim','manti','Highway'],['hurricane','enterprise','State road'],['page','monument-valley','Highway']
];
const routeData=roadMap.routes as Record<string,[number,number][]>;
const routeCoords=(a:string,b:string)=>{const path=routeData[`${a}|${b}`]??routeData[`${b}|${a}`]?.slice().reverse();if(!path||path.length<2)throw new Error(`Missing road geometry for ${a} → ${b}`);return path;};
const projectPath=(path:[number,number][])=>path.map(point=>projectRoadPoint(point));
const averageRoadSpeedKmh:Record<Road,number>={'Freeway':95,'Highway':80,'State road':65,'County road':50};
function estimatedDriveMinutes(path:[number,number][],road:Road){let distanceKm=0;for(let i=1;i<path.length;i++){const [lon1,lat1]=path[i-1],[lon2,lat2]=path[i];const toRadians=(degrees:number)=>degrees*Math.PI/180;const dLat=toRadians(lat2-lat1),dLon=toRadians(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRadians(lat1))*Math.cos(toRadians(lat2))*Math.sin(dLon/2)**2;distanceKm+=6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}return distanceKm/averageRoadSpeedKmh[road]*60;}
export const routeShapes=routeDefinitions.map(([a,b,road])=>({a,b,road,points:projectPath(routeCoords(a,b))}));
function addRoute(a:string,b:string,road:Road,path:{x:number;y:number}[]){
 const points=path;
 const lengths:number[]=[];let totalLength=0;for(let i=1;i<points.length;i++){const length=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lengths.push(length);totalLength+=length;}
 const pointAt=(distance:number)=>{let remaining=distance;for(let i=0;i<lengths.length;i++){const length=lengths[i];if(remaining<=length||i===lengths.length-1){const t=length?Math.max(0,Math.min(1,remaining/length)):0;return{x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};}remaining-=length;}return points.at(-1)!;};
 const segmentCount=Math.max(1,Math.round(estimatedDriveMinutes(routeCoords(a,b),road)/20));
 let prev=a;for(let i=1;i<=segmentCount;i++){const final=i===segmentCount,id=final?b:`${a}-${b}-${i}`,point=pointAt(totalLength*i/segmentCount);if(!final)spaces[id]={id,name:`${spaces[a].name}–${spaces[b].name} · ${i}/${segmentCount}`,...point,hub:false};edges.push({a:prev,b:id,road,barrel:false});prev=id;}
}
for(const [a,b,road] of routeDefinitions){const projected=projectPath(routeCoords(a,b));addRoute(a,b,road,projected);}
export const destinationLocations=[
 'evanston','simpson-springs','bonneville-salt-flats','hill-aerospace-museum','lagoon','hogle-zoo','heber-valley-railroad','timpanogos-cave','utah-olympic-park','bear-lake',
 'mirror-lake','bingham-canyon-mine','temple-square','this-is-the-place','antelope-island','camp-floyd','snowbird','living-planet-aquarium','slc-airport','scofield-reservoir',
 'goshen-movie-set','spiral-jetty','mount-timpanogos','soldier-hollow','cherry-hill','dugway','starvation-reservoir','golden-spike','lava-hot-springs','yuba-state-park',
 'nine-mile-canyon','little-sahara','meadow-lava-tubes','halls-crossing','arches','bryce-canyon','canyonlands','capitol-reef','mesa-verde','great-basin',
 'grand-canyon','natural-bridges','bears-ears','grand-staircase','cedar-breaks','hole-in-rock','flaming-gorge','monument-valley','newspaper-rock','topaz-mountain',
 'the-wave','zion','snow-canyon','mountain-meadows','coyote-gulch','dark-canyon','valley-of-the-gods','navajo-mountain','fort-kanab','coral-pink-sand-dunes',
 'dinosaur-nm','rainbow-bridge','hovenweep','goosenecks','san-rafael-swell','wilberg-mine','four-corners','glen-canyon-dam','goblin-valley','dead-horse-point',
 'edge-of-cedars','fremont-indian','usu','uofu','weber-state','uvu','byu','snow-college','suu','utah-tech',
] as const;
export const destinations=cards.map(card=>({id:card.id,hub:destinationLocations[card.id-1],alternateHubs:card.id===41?['grand-canyon-south-rim']:[],type:card.id<=32?'easy' as StopType:card.id<=72?'hard' as StopType:'education' as StopType}));
export function destinationHubs(destination:number|typeof destinations[number]){const selected=typeof destination==='number'?destinations.find(item=>item.id===destination):destination;return selected?[selected.hub,...selected.alternateHubs]:[]}
export const homeBases=['st-george','richfield','blanding','provo','fillmore','salt-lake-city','ogden','logan'] as const;
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
function maybeQuestionAtCurrentSpace(g:Game){const p=g.players[g.turn],id=p.cards.find(cardId=>!p.visited.includes(cardId)&&destinationHubs(cardId).includes(p.pos));if(id!==undefined){startQuestion(g,id);return true}return false}
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
  case 'ski':{const resorts=['park-city','snowbird','logan','cedar-city'];p.pos=resorts.includes(choice||'')?choice!:resorts[Math.floor(Math.random()*resorts.length)];checkArrival=true;break;}
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
 const destination=p.cards.find(id=>!p.visited.includes(id)&&destinationHubs(id).includes(to));
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
 const turn=g.turn;const p=g.players[turn];const targets=p.cards.filter(id=>!p.visited.includes(id)).map(id=>destinationHubs(id).sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0]);if(!targets.length)targets.push(p.homeBase);
 const target=targets.sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0];if(g.phase==='roll')roll(g);
 let steps=0;while(g.turn===turn&&g.phase==='move'&&steps++<6){
  const options=allowed(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target));
  if(!options.length&&g.roll===6&&!g.coneMovedThisTurn&&nearbyCones(g).length){const key=nearbyCones(g)[0],open=edges.filter(e=>!isConstruction(g,e));if(open.length){beginConeMove(g,key);relocateCone(g,edgeKey(open[0].a,open[0].b));continue;}}
  if(!options.length&&switchableRoads(g).length){const road=switchableRoads(g).sort((a,b)=>Math.min(...neighbors(p.pos).filter(e=>e.road===a).map(e=>distance(e.to,target)))-Math.min(...neighbors(p.pos).filter(e=>e.road===b).map(e=>distance(e.to,target))))[0];changeRoad(g,road);if(g.phase!=='move')break;continue;}
  if(!options.length||distance(options[0].to,target)>=distance(p.pos,target)){endTurn(g);break;}move(g,options[0].to);
 }
}
