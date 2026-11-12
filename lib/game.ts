import cards from './cards.json';
import {scenarioCards,type ScenarioEffect} from './scenarios';
import roadMap from './road-map-data.json';
import blackDotNumberIds from './black-dot-number-ids.json';
export type Road = 'Freeway' | 'Highway' | 'State road' | 'County road';
export type StopType='easy'|'hard'|'education';
export type StopMix=Record<StopType,number>;
export const defaultStopMix:StopMix={easy:2,hard:1,education:0};
export const colors = ['#d85535','#277a96','#d49a23','#7b5da5','#329568','#d25c8e','#4a64c1','#745343'];
// Hubs are plotted from real-world coordinates and the road network is bundled locally.
const sourceHubs = [
 ['salt-lake-city','Salt Lake City',347,263],['ogden','Ogden',376,171],['logan','Logan',416,89],['bear-lake','Bear Lake',475,40],
 ['west-wendover','West Wendover, NV',37,285],['park-valley','Park Valley',145,238],['oasis','Oasis, NV',78,409],['park-city','Park City',458,322],['heber-city','Heber City',519,346],['vernal','Vernal',796,254],
 ['provo','Provo',443,414],['nephi','Nephi',405,550],['delta','Delta',274,614],['price','Price',573,549],
 ['green-river','Green River',703,665],['moab','Moab',795,769],['arches','Arches - NP',819,747],['canyonlands','Canyonlands',712,790],
 ['richfield','Richfield',401,714],['torrey','Torrey',472,800],['bryce-canyon','Bryce Canyon',361,947],['cedar-city','Cedar City',231,973],
 ['zion','Springdale / Zion',143,1039],['st-george','St. George',168,1077],['kanab','Kanab',342,1046],['monument-valley','Monument Valley',781,1030],
 ['blanding','Blanding',751,970],['goblin-valley','Goblin Valley',599,698],['flaming-gorge','Flaming Gorge',683,168],['evanston','Evanston, WY',558,166],
 ['fillmore','Fillmore',340,819],['bluff','Bluff',748,1022],
 ['brigham-city','Brigham City',374,142],['tremonton','Tremonton',358,91],['i84-idaho-border','I-84 · Idaho line',334,24],['i84-sr30-junction','I-84 / SR-30',290,53],['boise','Boise, ID',124,185],['malad-city','Malad City, ID',385,66],['pocatello','Pocatello, ID',400,116],['preston','Preston, ID',355,55],['garden-city','Garden City',425,96],
 ['coalville','Coalville',517,257],['echo','Echo',503,232],['rock-springs','Rock Springs, WY',827,167],['tooele','Tooele',261,329],
 ['grantsville','Grantsville',236,349],['farmington','Farmington',364,220],['kaysville','Kaysville',373,205],['layton','Layton',377,190],
 ['antelope-island','Antelope Island',305,205],['slc-airport','Salt Lake City Airport',340,239],['sandy','Sandy',352,295],['draper','Draper',359,315],
 ['lehi','Lehi',385,350],['orem','Orem',433,390],['spanish-fork','Spanish Fork',438,438],['payson','Payson',418,470],['yuba-i15-exit','Yuba Lake · I-15 Exit 202',324,577],
 ['scipio','Scipio',342,620],['salina','Salina',415,678],['ephraim','Ephraim',393,640],['manti','Manti',404,658],['thistle','Thistle Junction',454,485],
 ['cove-fort','Cove Fort',289,754],['beaver','Beaver',269,840],['milford','Milford',204,811],['parowan','Parowan',230,927],
 ['panguitch','Panguitch',305,919],['escalante','Escalante',434,917],['boulder','Boulder',462,888],['hanksville','Hanksville',525,789],
 ['loa','Loa',434,778],['cisco','Cisco',847,684],['monticello','Monticello',782,988],['cortez','Cortez, CO',858,1024],
 ['page','Page, AZ',691,1069],['grand-canyon','Grand Canyon North Rim, AZ',488,1040],['grand-canyon-south-rim','Grand Canyon South Rim, AZ',495,1080],['jacob-lake','Jacob Lake, AZ',468,967],['baker','Road Junction',89,1030],['ely','Ely, NV',102,712],
 ['mesquite','Mesquite, NV',127,1081],['hurricane','Hurricane',154,1056],['enterprise','Enterprise',105,1025],
 ['fairfield','Fairfield',303,376],['goshen','Goshen',350,453],['vernon','Vernon',275,491],['dugway','Dugway',191,423],['jericho','Jericho',322,557],
 ['scofield','Scofield',472,565],['duchesne','Duchesne',621,444],['roosevelt','Roosevelt',684,385],['myton','Myton',646,418],
 ['dinosaur','Dinosaur, CO',839,291],['mountain-view','Mountain View, WY',643,199],['manila','Manila',643,219],['dutch-john','Dutch John',798,250],
 ['halls-crossing','Halls Crossing',561,987],['natural-bridges','Natural Bridges',722,991],
 ['four-corners','Four Corners',794,1071],['kayenta','Kayenta, AZ',819,1082],
 ['cannonville','Cannonville',337,933],['circleville','Circleville',287,875],
 ['simpson-springs','Simpson Springs',229,430],['topaz-mountain','Topaz Mountain',263,681],
 ['soldier-hollow','Soldier Hollow',508,372],['mirror-lake','Mirror Lake Highway',553,307],['snowbird','Snowbird',373,299],['living-planet-aquarium','Living Planet Aquarium',359,310],
 ['cherry-hill','Cherry Hill',371,190],['golden-spike','Golden Spike',303,123],['dinosaur-nm','Dinosaur - NM',807,269],['little-sahara','Little Sahara',291,579],
 ['nine-mile-canyon','Nine Mile Canyon',622,513],['fremont-indian','Fremont Indian - SP',375,725],['meadow','Meadow',298,863],['cedar-breaks','Cedar Breaks - NM',228,946],
 ['mountain-meadows','Mountain Meadows',136,1015],['snow-canyon','Snow Canyon',138,1060],['coral-pink-sand-dunes','Coral Pink Sand Dunes',313,1040],
 ['the-wave','The Wave',343,1058],['coyote-gulch','Coyote Gulch',424,953],['hole-in-rock','Hole in the Rock',578,956],['dark-canyon','Dark Canyon',700,951],
 ['edge-of-cedars','Edge of the Cedars',766,989],['newspaper-rock','Newspaper Rock',735,975],['valley-of-the-gods','Valley of the Gods',777,1011],['goosenecks','Goosenecks',728,1041],
 ['navajo-mountain','Navajo Mountain',638,1036],['glen-canyon-dam','Glen Canyon Dam',681,1054],['usu','Utah State University',433,74],['uofu','University of Utah',364,231],
 ['weber-state','Weber State University',391,155],['uvu','Utah Valley University',447,385],['byu','Brigham Young University',459,416],['snow-college','Snow College',406,660],
 ['suu','Southern Utah University',248,982],['utah-tech','Utah Tech University',184,1086],
 ['hill-aerospace-museum','Hill Aerospace Museum',405,148],['lagoon','Lagoon',355,204],['hogle-zoo','Hogle Zoo',350,299],['timpanogos-cave','Timpanogos Cave',407,365],
 ['bingham-canyon-mine','Bingham Canyon Mine',296,316],['temple-square','Temple Square',331,251],['this-is-the-place','This Is the Place Heritage Park',371,280],['camp-floyd','Camp Floyd',315,388],
 ['scofield-reservoir','Scofield Reservoir',466,557],['goshen-movie-set','Goshen Movie Set',346,463],['spiral-jetty','Spiral Jetty',239,181],['mount-timpanogos','Mount Timpanogos',421,350],
 ['starvation-reservoir','Starvation Reservoir',650,435],['lava-hot-springs','Lava Hot Springs, ID',390,37],['yuba-state-park','Yuba - SP',320,526],['meadow-lava-tubes','Meadow Lava Tubes',289,866],
 ['capitol-reef','Capitol Reef - NP',453,806],['mesa-verde','Mesa Verde - NP, CO',875,1037],
 ['bears-ears','Bears Ears - NM',719,954],['grand-staircase','Grand Staircase–Escalante',392,938],['fort-kanab','Fort Kanab',357,1056],
 ['rainbow-bridge','Rainbow Bridge - NM',612,1058],['hovenweep','Hovenweep - NM',812,1010],['san-rafael-swell','San Rafael Swell',499,658],
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
const geoLine=(points:[number,number][])=>points.map(point=>projectRoadPoint(point));
// Generalized landform outlines in lon/lat, positioned against the same projection as roads.
export const lakeShapes=[
 {name:'Great Salt Lake',rings:[[[-112.48,41.77],[-112.35,41.78],[-112.23,41.76],[-112.12,41.73],[-112.04,41.68],[-111.99,41.61],[-111.96,41.53],[-111.94,41.45],[-111.93,41.36],[-111.91,41.28],[-111.89,41.21],[-111.86,41.14],[-111.85,41.06],[-111.86,40.99],[-111.90,40.93],[-111.96,40.88],[-112.03,40.83],[-112.09,40.77],[-112.15,40.71],[-112.23,40.68],[-112.30,40.70],[-112.37,40.75],[-112.44,40.78],[-112.52,40.77],[-112.59,40.73],[-112.67,40.70],[-112.75,40.72],[-112.83,40.77],[-112.91,40.81],[-112.99,40.86],[-113.04,40.92],[-113.04,40.99],[-113.01,41.06],[-112.97,41.13],[-112.98,41.20],[-112.93,41.26],[-112.90,41.33],[-112.87,41.40],[-112.83,41.47],[-112.79,41.54],[-112.73,41.60],[-112.66,41.65],[-112.59,41.70],[-112.53,41.74],[-112.48,41.77]]]},
 {name:'Lake Powell',rings:[
  [[-110.43,37.90],[-110.39,37.87],[-110.36,37.83],[-110.32,37.78],[-110.34,37.73],[-110.29,37.69],[-110.31,37.64],[-110.25,37.60],[-110.28,37.54],[-110.22,37.49],[-110.26,37.44],[-110.19,37.40],[-110.22,37.34],[-110.16,37.29],[-110.17,37.24],[-110.11,37.18],[-110.13,37.12],[-110.08,37.06],[-110.12,37.00],[-110.19,36.95],[-110.29,36.92],[-110.42,36.92],[-110.55,36.93],[-110.68,36.94],[-110.82,36.97],[-110.92,36.97],[-111.01,36.91],[-111.12,36.90],[-111.23,36.92],[-111.37,36.92],[-111.48,36.97],[-111.48,37.02],[-111.41,37.07],[-111.32,37.11],[-111.22,37.16],[-111.12,37.20],[-111.03,37.24],[-110.96,37.29],[-110.89,37.31],[-110.84,37.35],[-110.80,37.40],[-110.77,37.45],[-110.75,37.51],[-110.75,37.56],[-110.71,37.61],[-110.67,37.65],[-110.64,37.70],[-110.60,37.74],[-110.56,37.78],[-110.53,37.82],[-110.48,37.87],[-110.43,37.90]],
  [[-111.62,37.75],[-111.57,37.71],[-111.54,37.67],[-111.48,37.63],[-111.43,37.60],[-111.39,37.55],[-111.35,37.51],[-111.29,37.48],[-111.25,37.44],[-111.19,37.42],[-111.13,37.42],[-111.08,37.44],[-111.00,37.45],[-110.92,37.44],[-110.84,37.41],[-110.77,37.40],[-110.82,37.44],[-110.91,37.48],[-111.00,37.50],[-111.08,37.50],[-111.13,37.49],[-111.19,37.51],[-111.24,37.55],[-111.29,37.58],[-111.35,37.62],[-111.41,37.66],[-111.47,37.70],[-111.54,37.76],[-111.62,37.75]],
  [[-110.20,37.42],[-110.12,37.40],[-110.06,37.36],[-109.99,37.33],[-109.92,37.31],[-109.85,37.28],[-109.79,37.26],[-109.76,37.22],[-109.81,37.20],[-109.87,37.22],[-109.94,37.24],[-110.01,37.26],[-110.07,37.29],[-110.13,37.31],[-110.18,37.34],[-110.23,37.37],[-110.20,37.42]]]},
 {name:'Utah Lake',rings:[[[-111.91,40.28],[-111.84,40.34],[-111.75,40.34],[-111.69,40.31],[-111.66,40.23],[-111.68,40.15],[-111.73,40.08],[-111.82,40.07],[-111.89,40.12],[-111.92,40.20],[-111.91,40.28]]]}
];
export const islandShapes=[{name:'Antelope Island',points:geoLine([[-112.27,41.15],[-112.22,41.17],[-112.17,41.16],[-112.12,41.13],[-112.10,41.09],[-112.12,41.05],[-112.10,41.01],[-112.11,40.97],[-112.14,40.93],[-112.16,40.89],[-112.21,40.87],[-112.26,40.90],[-112.29,40.95],[-112.30,41.00],[-112.32,41.05],[-112.31,41.10],[-112.27,41.15]])}];
// Generalized Lake Powell coves and arms are traced as overlapping water polygons.
export const mappedLakes=lakeShapes.map(lake=>({...lake,rings:lake.rings.map(ring=>geoLine(ring))}));
const landform=(name:string,ring:[number,number][],label:[number,number],angle=0)=>({name,points:geoLine(ring),label:projectRoadPoint(label),angle});
export const mountainShapes=[
 landform('Uinta Mountains',[[-111.72,40.55],[-111.48,40.64],[-111.24,40.72],[-111.02,40.69],[-110.81,40.77],[-110.61,40.79],[-110.41,40.76],[-110.19,40.83],[-109.98,40.89],[-109.75,40.91],[-109.56,40.82],[-109.75,40.72],[-109.98,40.67],[-110.20,40.62],[-110.42,40.63],[-110.64,40.59],[-110.86,40.60],[-111.08,40.55],[-111.31,40.51],[-111.52,40.48],[-111.72,40.55]],[-110.55,40.68],-4),
 landform('Wasatch Range',[[-111.82,41.53],[-111.65,41.39],[-111.66,41.18],[-111.58,40.98],[-111.61,40.78],[-111.53,40.57],[-111.54,40.36],[-111.51,40.16],[-111.58,39.94],[-111.64,39.75],[-111.78,39.68],[-111.78,39.91],[-111.73,40.14],[-111.72,40.35],[-111.78,40.56],[-111.76,40.77],[-111.83,40.97],[-111.81,41.19],[-111.86,41.38],[-111.82,41.53]],[-111.72,40.45],-78),
 landform('Wasatch Plateau',[[-111.46,39.86],[-111.28,39.82],[-111.17,39.61],[-111.10,39.39],[-111.12,39.17],[-111.20,38.98],[-111.32,38.91],[-111.38,39.12],[-111.42,39.34],[-111.49,39.56],[-111.46,39.86]],[-111.29,39.38],-75),
 landform('Pavant Range',[[-112.24,39.73],[-112.11,39.62],[-112.08,39.42],[-112.12,39.22],[-112.23,39.08],[-112.31,39.18],[-112.30,39.40],[-112.27,39.59],[-112.24,39.73]],[-112.19,39.4],-78),
 landform('Tushar Mountains',[[-112.43,38.55],[-112.26,38.58],[-112.08,38.48],[-112.03,38.30],[-112.11,38.14],[-112.26,38.11],[-112.39,38.23],[-112.43,38.39],[-112.43,38.55]],[-112.23,38.35],-20),
];
// Bonneville Salt Flats outline around the Speedway, just north of I-80 and east of the Nevada line.
export const saltFlatsShape=geoLine([[-113.88,40.765],[-113.85,40.79],[-113.80,40.83],[-113.76,40.86],[-113.72,40.88],[-113.70,40.89],[-113.68,40.88],[-113.71,40.86],[-113.73,40.81],[-113.75,40.81],[-113.75,40.775],[-113.78,40.775],[-113.78,40.758],[-113.94,40.755],[-113.92,40.77],[-113.88,40.765]]);
export const riverShapes=[
 {name:'Green River',points:geoLine([[-109.43,40.91],[-109.57,40.76],[-109.64,40.58],[-109.59,40.39],[-109.68,40.19],[-109.80,40.02],[-109.76,39.80],[-109.84,39.61],[-109.93,39.41],[-110.02,39.20],[-110.16,38.995],[-110.18,38.79],[-110.15,38.57],[-110.05,38.38],[-109.96,38.22],[-110.00,38.18]])},
 {name:'Colorado River',points:geoLine([[-109.04,39.45],[-109.17,39.30],[-109.33,39.13],[-109.52,38.97],[-109.60,38.78],[-109.57,38.59],[-109.56,38.48],[-109.63,38.35],[-109.76,38.27],[-109.90,38.22],[-110.00,38.18],[-110.04,38.02],[-110.10,37.82],[-110.16,37.61],[-110.58,37.56],[-110.76,37.50],[-110.84,37.44],[-110.84,37.36],[-110.75,37.28],[-110.70,37.10],[-110.87,37.00],[-111.04,36.94],[-111.19,36.93],[-111.31,36.98],[-111.40,36.98],[-111.483,36.936]])},
 {name:'Sevier River',points:geoLine([[-112.50,37.51],[-112.43,37.72],[-112.30,37.95],[-112.25,38.18],[-112.16,38.40],[-112.12,38.64],[-112.08,38.77],[-111.96,38.91],[-111.86,39.02],[-111.78,39.17],[-111.86,39.31],[-112.04,39.38],[-112.28,39.36],[-112.52,39.32],[-112.75,39.27],[-112.96,39.15],[-113.03,39.10]])},
];
export const riverLabels=[['Green River',[-110.38,39.12]]].map(([name,point])=>({name:name as string,...projectRoadPoint(point as [number,number])}));
export const sevierLakeShape=geoLine([[-113.17,39.16],[-113.04,39.22],[-112.89,39.20],[-112.78,39.14],[-112.78,39.06],[-112.88,39.01],[-113.04,39.00],[-113.17,39.06],[-113.17,39.16]]);
export const bookCliffsShape=landform('Book Cliffs',[[-110.30,39.28],[-110.28,39.35],[-110.21,39.34],[-110.06,39.35],[-109.82,39.32],[-109.56,39.28],[-109.38,39.22],[-109.48,39.15],[-109.75,39.18],[-110.00,39.20],[-110.25,39.18],[-110.32,39.19],[-110.31,39.22],[-110.30,39.28]],[-109.88,39.265],0);
export type Space={id:string;name:string;x:number;y:number;hub:boolean};
export type Edge={a:string;b:string;road:Road;barrel:boolean};
export const spaces: Record<string,Space> = Object.fromEntries(hubs.map(([id,name,x,y])=>[id,{id,name,x,y,hub:true}]));
const knownBlackDotLocations:ReadonlySet<string>=new Set((blackDotNumberIds as Array<[string,number]>).map(([id])=>id.slice(id.indexOf(':')+1)).filter(id=>id!=='monument-valley-kayenta-1'));
export const edges:Edge[]=[];
const routeDefinitions:[string,string,Road][]=[
 // Interstates and interstate connectors
 ['st-george','mesquite','Freeway'],['st-george','cedar-city','Freeway'],['cedar-city','beaver','Freeway'],['beaver','fillmore','Freeway'],['fillmore','nephi','Freeway'],['nephi','payson','Freeway'],['payson','spanish-fork','Freeway'],['spanish-fork','provo','Freeway'],['provo','orem','Freeway'],['orem','lehi','Freeway'],['lehi','draper','Freeway'],['draper','sandy','Freeway'],['sandy','salt-lake-city','Freeway'],['salt-lake-city','farmington','Freeway'],['farmington','kaysville','Freeway'],['kaysville','layton','Freeway'],['layton','ogden','Freeway'],['ogden','brigham-city','Freeway'],['brigham-city','tremonton','Freeway'],['tremonton','i84-idaho-border','Freeway'],['i84-idaho-border','i84-sr30-junction','Freeway'],['i84-sr30-junction','park-valley','State road'],['park-valley','oasis','State road'],['oasis','west-wendover','Freeway'],['i84-idaho-border','boise','Freeway'],['tremonton','malad-city','Freeway'],['malad-city','pocatello','Freeway'],['tremonton','preston','Highway'],
 ['salt-lake-city','tooele','Freeway'],['salt-lake-city','grantsville','Freeway'],['tooele','grantsville','Highway'],['grantsville','west-wendover','Freeway'],['salt-lake-city','echo','Freeway'],['ogden','echo','Freeway'],['echo','coalville','Freeway'],['coalville','evanston','Freeway'],['evanston','rock-springs','Freeway'],
 ['cove-fort','salina','Freeway'],['salina','green-river','Freeway'],['green-river','cisco','Freeway'],
 // US highways
 ['salt-lake-city','spanish-fork','Highway'],['spanish-fork','nephi','Highway'],['nephi','salina','State road'],['nephi','manti','State road'],['salina','richfield','Highway'],['circleville','richfield','Highway'],
 ['spanish-fork','price','Highway'],['price','green-river','Highway'],['cisco','moab','Highway'],['moab','monticello','Highway'],['monticello','blanding','Highway'],['blanding','bluff','Highway'],['bluff','kayenta','Highway'],['page','kayenta','Highway'],
 ['park-city','heber-city','Highway'],['heber-city','duchesne','Highway'],['duchesne','roosevelt','Highway'],['roosevelt','vernal','Highway'],['vernal','dinosaur','Highway'],
 ['logan','garden-city','Highway'],['garden-city','preston','Highway'],['ogden','logan','Highway'],['ephraim','thistle','Highway'],
 ['ely','baker','Highway'],['baker','delta','Highway'],['delta','scipio','Highway'],['scipio','salina','Highway'],
 ['kanab','page','Highway'],['zion','kanab','Highway'],['panguitch','kanab','Highway'],['page','grand-canyon-south-rim','Highway'],['kanab','jacob-lake','Highway'],['jacob-lake','grand-canyon','Highway'],['monticello','cortez','Highway'],['cortez','four-corners','Highway'],['four-corners','kayenta','Highway'],
 // Scenic state highways and county roads
 ['ogden','park-city','State road'],['park-city','salt-lake-city','State road'],['nephi','delta','State road'],['delta','milford','State road'],['milford','baker','State road'],['richfield','cove-fort','State road'],
 ['richfield','loa','State road'],['loa','torrey','State road'],['torrey','hanksville','State road'],['hanksville','green-river','State road'],['torrey','boulder','State road'],['boulder','escalante','State road'],['escalante','cannonville','State road'],['cannonville','bryce-canyon','State road'],['bryce-canyon','panguitch','State road'],['panguitch','circleville','Highway'],['panguitch','parowan','State road'],['parowan','cedar-city','State road'],
 ['hanksville','natural-bridges','State road'],['natural-bridges','blanding','State road'],['bluff','monument-valley','State road'],['monument-valley','kayenta','State road'],['moab','arches','State road'],['moab','canyonlands','State road'],['green-river','goblin-valley','State road'],['price','scofield','State road'],['price','duchesne','State road'],['vernal','flaming-gorge','State road'],['flaming-gorge','manila','State road'],['manila','dutch-john','State road'],['dutch-john','mountain-view','County road'],
 ['west-wendover','bonneville-salt-flats','County road'],['logan','bear-lake','County road'],['park-city','utah-olympic-park','County road'],['heber-city','heber-valley-railroad','County road'],['heber-city','mirror-lake','County road'],['mirror-lake','evanston','State road'],['salt-lake-city','utah-fairgrounds','County road'],['spanish-fork','camp-floyd','County road'],['natural-bridges','halls-crossing','State road'],
 ['salt-lake-city','antelope-island','County road'],['salt-lake-city','slc-airport','County road'],['tooele','dugway','State road'],['vernon','simpson-springs','County road'],['goshen','vernon','County road'],['camp-floyd','vernon','State road'],['delta','topaz-mountain','County road'],['nephi','jericho','County road'],['nephi','goshen','County road'],['spanish-fork','fairfield','County road'],['park-city','soldier-hollow','County road'],['heber-city','soldier-hollow','County road'],
 ['salt-lake-city','snowbird','County road'],['sandy','living-planet-aquarium','County road'],['farmington','lagoon','County road'],['ogden','hill-aerospace-museum','County road'],['salt-lake-city','hogle-zoo','County road'],['salt-lake-city','temple-square','County road'],['salt-lake-city','this-is-the-place','County road'],['ogden','weber-state','County road'],['salt-lake-city','uofu','County road'],['provo','byu','County road'],['orem','uvu','County road'],['logan','usu','County road'],['ephraim','snow-college','County road'],['cedar-city','suu','County road'],['st-george','utah-tech','County road'],['spanish-fork','timpanogos-cave','County road'],['spanish-fork','mount-timpanogos','County road'],['salt-lake-city','bingham-canyon-mine','County road'],['tooele','spiral-jetty','County road'],['roosevelt','starvation-reservoir','County road'],['preston','lava-hot-springs','County road'],['nephi','yuba-i15-exit','Freeway'],['yuba-i15-exit','yuba-state-park','County road'],['yuba-state-park','salina','State road'],['fillmore','meadow','County road'],['salina','meadow-lava-tubes','County road'],['richfield','fremont-indian','County road'],['torrey','capitol-reef','County road'],['cortez','mesa-verde','County road'],['monticello','bears-ears','County road'],['escalante','grand-staircase','County road'],['kanab','fort-kanab','County road'],['natural-bridges','rainbow-bridge','County road'],['blanding','hovenweep','County road'],['green-river','san-rafael-swell','County road'],['ephraim','wilberg-mine','County road'],['price','wilberg-mine','State road'],['moab','dead-horse-point','County road'],['blanding','edge-of-cedars','County road'],['blanding','newspaper-rock','County road'],['page','glen-canyon-dam','County road'],['cedar-city','enterprise','State road'],['enterprise','mountain-meadows','State road'],['st-george','hurricane','State road'],['salina','ephraim','Highway'],['price','scofield-reservoir','County road'],['goshen','goshen-movie-set','County road'],['farmington','cherry-hill','County road'],['tremonton','golden-spike','County road'],['price','nine-mile-canyon','State road'],['nephi','little-sahara','County road'],['parowan','cedar-breaks','County road'],['coyote-gulch','hole-in-rock','County road'],['kanab','the-wave','County road'],['hurricane','zion','State road'],['st-george','snow-canyon','County road'],['escalante','coyote-gulch','County road'],['blanding','dark-canyon','County road'],['bluff','valley-of-the-gods','County road'],['bluff','navajo-mountain','County road'],['bluff','goosenecks','County road'],['kanab','coral-pink-sand-dunes','County road'],['vernal','dinosaur-nm','County road'],['myton','duchesne','County road'],['ephraim','manti','Highway'],['hurricane','enterprise','State road'],['page','monument-valley','Highway']
];
const routeData=roadMap.routes as Record<string,[number,number][]>;
const routeCoords=(a:string,b:string)=>{const path=routeData[`${a}|${b}`]??routeData[`${b}|${a}`]?.slice().reverse();if(!path||path.length<2)throw new Error(`Missing road geometry for ${a} → ${b}`);return path;};
const projectPath=(path:[number,number][])=>path.map(point=>projectRoadPoint(point));
const averageRoadSpeedKmh:Record<Road,number>={'Freeway':95,'Highway':80,'State road':65,'County road':50};
function estimatedDriveMinutes(path:[number,number][],road:Road){let distanceKm=0;for(let i=1;i<path.length;i++){const [lon1,lat1]=path[i-1],[lon2,lat2]=path[i];const toRadians=(degrees:number)=>degrees*Math.PI/180;const dLat=toRadians(lat2-lat1),dLon=toRadians(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(toRadians(lat1))*Math.cos(toRadians(lat2))*Math.sin(dLon/2)**2;distanceKm+=6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}return distanceKm/averageRoadSpeedKmh[road]*60;}
export const routeShapes=routeDefinitions.map(([a,b,road])=>({a,b,road,points:projectPath(routeCoords(a,b))}));
export type RoadMapSegment={a:string;b:string;road:Road;points:{x:number;y:number}[]};
export const roadMapSegments:RoadMapSegment[]=[];
function addRoute(a:string,b:string,road:Road,path:{x:number;y:number}[]){
 const points=path;
 const lengths:number[]=[];let totalLength=0;for(let i=1;i<points.length;i++){const length=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lengths.push(length);totalLength+=length;}
 const pointAt=(distance:number)=>{let remaining=distance;for(let i=0;i<lengths.length;i++){const length=lengths[i];if(remaining<=length||i===lengths.length-1){const t=length?Math.max(0,Math.min(1,remaining/length)):0;return{x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t};}remaining-=length;}return points.at(-1)!;};
 const segmentCount=Math.max(1,Math.round(estimatedDriveMinutes(routeCoords(a,b),road)/20),a==='price'&&b==='nine-mile-canyon'?2:1);
 let prev=a,previousDistance=0;for(let i=1;i<=segmentCount;i++){const final=i===segmentCount,id=final?b:`${a}-${b}-${i}`,distance=totalLength*i/segmentCount,point=pointAt(distance);if(!final)spaces[id]={id,name:`${spaces[a].name}–${spaces[b].name} · ${i}/${segmentCount}`,...point,hub:false};edges.push({a:prev,b:id,road,barrel:false});
  const segmentPoints=[spaces[prev],...points.slice(1,-1).filter(candidate=>{let along=0;for(let j=1;j<points.length;j++){const length=Math.hypot(points[j].x-points[j-1].x,points[j].y-points[j-1].y);if(candidate===points[j]){along+=length;break;}along+=length;}return along>previousDistance&&along<distance;}),point];
  roadMapSegments.push({a:prev,b:id,road,points:segmentPoints.map((p,index)=>index===0?{x:spaces[prev].x,y:spaces[prev].y}:index===segmentPoints.length-1?{x:point.x,y:point.y}:p)});prev=id;previousDistance=distance;}
}
for(const [a,b,road] of routeDefinitions){const projected=projectPath(routeCoords(a,b));addRoute(a,b,road,projected);}
const coloradoRiver=riverShapes.find(river=>river.name==='Colorado River');
const riverStart=spaces['hanksville-natural-bridges-5'],riverEnd=spaces['rainbow-bridge'];
if(coloradoRiver&&riverStart&&riverEnd){
 let startIndex=0,endIndex=0,startDistance=Infinity,endDistance=Infinity;
 coloradoRiver.points.forEach((point,index)=>{const fromStart=Math.hypot(point.x-riverStart.x,point.y-riverStart.y),fromEnd=Math.hypot(point.x-riverEnd.x,point.y-riverEnd.y);if(fromStart<startDistance){startDistance=fromStart;startIndex=index;}if(fromEnd<endDistance){endDistance=fromEnd;endIndex=index;}});
 if(startIndex<endIndex)coloradoRiver.points=[...coloradoRiver.points.slice(0,startIndex),riverStart,riverEnd,...coloradoRiver.points.slice(endIndex+1)];
}
export const destinationLocations=[
 'evanston','simpson-springs','bonneville-salt-flats','hill-aerospace-museum','lagoon','hogle-zoo','heber-valley-railroad','timpanogos-cave','utah-olympic-park','bear-lake',
 'mirror-lake','bingham-canyon-mine','temple-square','this-is-the-place','antelope-island','camp-floyd','snowbird','living-planet-aquarium','slc-airport','scofield-reservoir',
 'goshen-movie-set','spiral-jetty','mount-timpanogos','soldier-hollow','cherry-hill','dugway','starvation-reservoir','golden-spike','lava-hot-springs','nephi-salina-1',
 'nine-mile-canyon','little-sahara','meadow-lava-tubes','halls-crossing','arches','bryce-canyon','canyonlands','capitol-reef','mesa-verde','baker',
 'grand-canyon','natural-bridges','bears-ears','grand-staircase','cedar-breaks','hole-in-rock','flaming-gorge','monument-valley','newspaper-rock','topaz-mountain',
 'the-wave','zion','snow-canyon','mountain-meadows','coyote-gulch','dark-canyon','valley-of-the-gods','navajo-mountain','fort-kanab','coral-pink-sand-dunes',
 'dinosaur-nm','rainbow-bridge','hovenweep','goosenecks','san-rafael-swell','wilberg-mine','four-corners','glen-canyon-dam','goblin-valley','dead-horse-point',
 'edge-of-cedars','fremont-indian','usu','uofu','weber-state','uvu','byu','snow-college','suu','utah-tech',
] as const;
export const destinations=cards.map(card=>({id:card.id,hub:destinationLocations[card.id-1],alternateHubs:card.id===41?['grand-canyon-south-rim']:[],type:card.id<=32?'easy' as StopType:card.id<=72?'hard' as StopType:'education' as StopType}));
export function destinationHubs(destination:number|typeof destinations[number]){const selected=typeof destination==='number'?destinations.find(item=>item.id===destination):destination;return selected?[selected.hub,...selected.alternateHubs]:[]}
export const homeBases=['st-george','richfield','blanding','provo','fillmore','salt-lake-city','ogden','logan'] as const;
export type Player={name:string;bot:boolean;pos:string;homeBase:string;road:Road|null;cards:number[];visited:number[];cones:string[];hand:string[];skipTurns:number;extraTurns:number;passCount:number;roadCardDue:boolean;electricRoad:Road|null;doubleTurn:boolean;slowRoad:Road|null;token?:string};
export type CardReveal={id:string;ownerSeat:number;recipientSeat:number;cardId:string};
export type Game={players:Player[];turn:number;round:number;roll:number;left:number;phase:'lobby'|'cones'|'roll'|'move'|'relocate'|'question'|'destination-choice'|'event'|'hand'|'card-reveal'|'won';pending:number|null;pendingDestination:number|null;destinationChoiceReturnPhase:'move'|'roll'|'end'|null;pendingQuestion:string|null;questionDeadline:number|null;pendingScenario:string|null;pendingRoad:Road|null;roadChangeDot:string|null;roadChangeType:Road|null;coneToMove:string|null;coneMovedThisTurn:boolean;constructionChoiceMade:boolean;constructionPromptDismissed:boolean;roadChoicePending:boolean;cardDrawReturnPhase:'move'|'roll'|null;nextRollBonus:number;halveNextRoll:boolean;cardReveals:CardReveal[];scenarioDeck:string[];scenarioDiscard:string[];stock:number[];stopMix:StopMix;log:string[];winner:number|null;humans:number;online:boolean;host?:string;rev:number};
export function edgeKey(a:string,b:string){return [a,b].sort().join('|')}
export function isConstruction(g:Game,e:Edge){const key=edgeKey(e.a,e.b),to=(e as Edge & {to?:string}).to;return e.barrel||g.players.some(p=>p.cones.includes(key)||(!!to&&p.cones.includes(to)))}
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
  players.push({name:i===0?name:i<humans?`Driver ${i+1}`:`Computer ${i-humans+1}`,bot:i>=humans,pos:homeBase,homeBase,road:null,cards:assigned,visited:[],cones:[],hand:[],skipTurns:0,extraTurns:0,passCount:0,roadCardDue:false,electricRoad:null,doubleTurn:false,slowRoad:null});
 }
 const stock=[...pools.easy,...pools.hard,...pools.education];
 const scenarioDeck=scenarioCards.map(c=>c.id);for(let j=scenarioDeck.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[scenarioDeck[j],scenarioDeck[k]]=[scenarioDeck[k],scenarioDeck[j]];}
 return {players,turn:0,round:1,roll:0,left:0,phase:online?'lobby':'cones',pending:null,pendingDestination:null,destinationChoiceReturnPhase:null,pendingQuestion:null,questionDeadline:null,pendingScenario:null,pendingRoad:null,roadChangeDot:null,roadChangeType:null,coneToMove:null,coneMovedThisTurn:false,constructionChoiceMade:false,constructionPromptDismissed:false,roadChoicePending:false,cardDrawReturnPhase:null,nextRollBonus:0,halveNextRoll:false,cardReveals:[],scenarioDeck,scenarioDiscard:[],stock,stopMix:{...stopMix},log:[`Place two construction cones each, then collect ${total} stops and return to your assigned home base.`],winner:null,humans,online,rev:0};
}
export function hydrateGame(game:Game,validBlackDots?:ReadonlySet<string>){
 if(!Array.isArray(game.players)||game.players.length===0)throw new Error('This saved game is incomplete. Start a new game to continue.');
 let recoveredPosition=false;
 game.players.forEach(player=>{if(!spaces[player.homeBase]){player.homeBase=homeBases[Math.floor(Math.random()*homeBases.length)];recoveredPosition=true;}if(!spaces[player.pos]){player.pos=player.homeBase;recoveredPosition=true;}player.hand??=[];player.cones??=[];player.skipTurns??=0;player.extraTurns??=0;player.passCount??=0;player.roadCardDue??=false;player.electricRoad??=null;player.doubleTurn??=false;player.slowRoad??=null;});
 if(validBlackDots){const occupied=new Set<string>(),replacements=new Map<string,string>();for(const player of game.players)player.cones=player.cones.map(cone=>{if(!cone.includes('|')){occupied.add(cone);return cone;}const [a,b]=cone.split('|'),replacement=[a,b].find(id=>validBlackDots.has(id)&&!occupied.has(id));if(!replacement)return cone;occupied.add(replacement);replacements.set(cone,replacement);return replacement;});if(game.coneToMove&&replacements.has(game.coneToMove))game.coneToMove=replacements.get(game.coneToMove)!;}
 if(!Number.isInteger(game.turn)||game.turn<0||game.turn>=game.players.length)game.turn=0;
 game.log??=[];if(recoveredPosition)game.log=['Recovered an older save with an outdated map position; the affected driver returned to their home base.',...game.log].slice(0,40);
 game.pendingQuestion??=game.pending===null?null:cards.find(c=>c.id===game.pending)?.questions[0]??null;
 game.pendingDestination??=null;game.destinationChoiceReturnPhase??=null;game.cardReveals??=[];game.questionDeadline??=game.phase==='question'?Date.now()+60000:null;game.pendingScenario??=null;game.pendingRoad??=null;game.roadChangeDot??=null;game.roadChangeType??=null;game.coneToMove??=null;game.coneMovedThisTurn??=false;game.constructionChoiceMade??=false;game.constructionPromptDismissed??=false;game.roadChoicePending??=false;game.cardDrawReturnPhase??=null;game.nextRollBonus??=0;game.halveNextRoll??=false;
 game.scenarioDeck??=shuffle(scenarioCards.map(c=>c.id));game.scenarioDiscard??=[];game.stopMix??={...defaultStopMix};
 return game;
}
export function startGame(g:Game){if(g.phase!=='lobby')throw Error('Game already started.');g.turn=0;g.phase='cones';log(g,'Drivers: place two construction cones each before the first roll.')}
export function neighbors(id:string){return edges.filter(e=>e.a===id||e.b===id).map(e=>({...e,to:e.a===id?e.b:e.a}));}
function log(g:Game,s:string){g.log=[s,...g.log].slice(0,40)}
function moveCost(g:Game,e:Edge){const p=g.players[g.turn];return (p.doubleTurn||p.electricRoad===e.road)?0.5:1}
function canPassCone(g:Game,e:Edge){return !isConstruction(g,e)||g.roll===5||(g.roll===6&&g.constructionChoiceMade)||g.players[g.turn].passCount>0}
export function allowed(g:Game){const p=g.players[g.turn];return g.phase==='move'&&g.left>0?neighbors(p.pos).filter(e=>(!p.road||p.road===e.road)&&g.left>=moveCost(g,e)&&canPassCone(g,e)&&!(p.slowRoad===e.road&&!isConstruction(g,e)&&g.players.some((other,i)=>i!==g.turn&&other.pos!==p.pos&&distanceOnRoad(p.pos,other.pos,e.road)<distanceOnRoad(p.pos,e.to,e.road)))):[];}
export function roadChangeOptions(g:Game){const p=g.players[g.turn];return g.phase==='move'&&p.road&&g.left>0?neighbors(p.pos).filter(e=>e.road!==p.road&&g.left>=moveCost(g,e)&&canPassCone(g,e)):[];}
export function switchableRoads(g:Game){const p=g.players[g.turn];return g.phase==='move'&&g.left>0&&p.road?Array.from(new Set(neighbors(p.pos).map(e=>e.road).filter(r=>r!==p.road))):[];}
function shuffle<T>(items:T[]){for(let j=items.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[items[j],items[k]]=[items[k],items[j]];}return items}
function drawScenarioId(g:Game){if(!g.scenarioDeck.length){g.scenarioDeck=shuffle(g.scenarioDiscard.splice(0));}return g.scenarioDeck.shift()}
function discardScenario(g:Game,id:string){g.scenarioDiscard.push(id);g.cardReveals=g.cardReveals.filter(reveal=>reveal.cardId!==id)}
function resumeAfterCard(g:Game){const phase=g.cardDrawReturnPhase??'move';g.cardDrawReturnPhase=null;return phase}
function drawDueRoadCard(g:Game,p:Player){
 if(!p.roadCardDue){g.phase='roll';return;}
 p.roadCardDue=false;const id=drawScenarioId(g);if(!id){log(g,`${p.name} has no scenario card to draw.`);g.phase='roll';return;}
 const card=scenarioCards.find(item=>item.id===id)!;if(card.type!=='hold')log(g,`${p.name} drew “${card.title}” for changing road type.`);
 if(card.type==='hold'){
  if(p.hand.length<3){p.hand.push(id);g.pendingScenario=id;g.pendingRoad=p.road;g.cardDrawReturnPhase='roll';g.phase='card-reveal';return;}
  g.pendingScenario=id;g.pendingRoad=p.road;g.cardDrawReturnPhase='roll';g.phase='hand';return;
 }
 g.pendingScenario=id;g.pendingRoad=p.road;g.cardDrawReturnPhase='roll';g.phase='event';
}
export function changeRoad(g:Game,road:Road){
 if(g.phase!=='move'||g.left<=0)throw Error('You need to be at an active road junction to change road types.');
 const p=g.players[g.turn];if(road===p.road)throw Error('You are already on that type of road.');
 if(!neighbors(p.pos).some(e=>e.road===road))throw Error('There is no road of that type at this junction.');
 if(!p.road){p.road=road;log(g,`${p.name} chose ${road} for the first road.`);return;}
 p.road=road;p.roadCardDue=true;g.roadChoicePending=false;g.roadChangeDot=null;g.roadChangeType=null;if(p.electricRoad&&p.electricRoad!==road)p.electricRoad=null;
 log(g,`${p.name} changed to ${road}. The turn ends; draw a scenario card at the beginning of the next turn.`);endTurn(g);
}
export function beginRoadChange(g:Game,to:string,road:Road){
 const p=g.players[g.turn],edge=neighbors(p.pos).find(item=>item.to===to&&item.road===road);
 if(g.phase!=='move'||!p.road||!edge||road===p.road||g.left<moveCost(g,edge)||!canPassCone(g,edge))throw Error('That dot is not available on a different road type.');
 g.roadChangeDot=to;g.roadChangeType=road;g.roadChoicePending=true;
}
export function confirmRoadChange(g:Game,confirm:boolean){
 if(g.phase!=='move'||!g.roadChoicePending||!g.roadChangeDot||!g.roadChangeType)throw Error('There is no road change waiting for confirmation.');
 const road=g.roadChangeType;g.roadChoicePending=false;g.roadChangeDot=null;g.roadChangeType=null;
 if(confirm)changeRoad(g,road);
}
export function playChangeRoadCard(g:Game,id:string,road:Road){
 const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===id);
 if(g.phase!=='move'||!card||card.effect!=='switch-road'||!p.hand.includes(id))throw Error('Choose a held Change Road Card.');
 if(!neighbors(p.pos).some(e=>e.road===road)||road===p.road)throw Error('Choose a different road type at this junction.');
 p.hand.splice(p.hand.indexOf(id),1);discardScenario(g,id);p.road=road;g.roadChoicePending=false;if(p.electricRoad&&p.electricRoad!==road)p.electricRoad=null;log(g,`${p.name} played a Change Road Card and switched to ${road}.`);
}
export function playConstructionPass(g:Game,id:string){const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===id);if(g.phase!=='move'||!card||card.effect!=='construction-pass'||!p.hand.includes(id))throw Error('Choose a held Construction Pass.');p.hand.splice(p.hand.indexOf(id),1);discardScenario(g,id);p.passCount++;log(g,`${p.name} saved a Construction Pass for the next cone.`)}
export function discardHeldCard(g:Game,id:string){
 if(g.phase!=='hand'||!g.pendingScenario)throw Error('No hand limit choice is waiting.');
 const p=g.players[g.turn],incoming=g.pendingScenario;
 if(id===incoming){discardScenario(g,incoming);log(g,`${p.name} discarded the newly drawn hold card.`);g.pendingScenario=null;g.pendingRoad=null;g.phase=resumeAfterCard(g);}
 else{const index=p.hand.indexOf(id);if(index<0)throw Error('Choose a card from your hand.');p.hand.splice(index,1);discardScenario(g,id);p.hand.push(incoming);log(g,`${p.name} discarded a held card and kept the new one.`);g.pendingScenario=incoming;g.phase='card-reveal';}
}
export function keepCardPrivate(g:Game,id:string){const p=g.players[g.turn],card=scenarioCards.find(item=>item.id===id);if(g.phase!=='card-reveal'||g.pendingScenario!==id||!p.hand.includes(id)||card?.type!=='hold')throw Error('Choose the newly drawn hold card.');g.pendingScenario=null;g.pendingRoad=null;g.phase=resumeAfterCard(g);}
export function showCardToPlayer(g:Game,id:string,recipientSeat:number){
 const p=g.players[g.turn],card=scenarioCards.find(item=>item.id===id);if(g.phase!=='card-reveal'||g.pendingScenario!==id||!p.hand.includes(id)||card?.type!=='hold')throw Error('Choose the newly drawn hold card.');
 if(!Number.isInteger(recipientSeat)||recipientSeat<0||recipientSeat>=g.players.length||recipientSeat===g.turn)throw Error('Choose another driver to show the card to.');
 if(g.online&&g.players[recipientSeat].bot)throw Error('Choose another human driver to show the card to.');
 g.cardReveals.push({id:`${g.round}-${g.turn}-${Date.now()}-${g.cardReveals.length}`,ownerSeat:g.turn,recipientSeat,cardId:id});g.pendingScenario=null;g.pendingRoad=null;g.phase=resumeAfterCard(g);
}
export function dismissCardReveal(g:Game,revealId:string,recipientSeat:number){const index=g.cardReveals.findIndex(reveal=>reveal.id===revealId&&reveal.recipientSeat===recipientSeat);if(index<0)throw Error('That shared card is no longer available.');g.cardReveals.splice(index,1);}
export function cancelScenario(g:Game,cardId:string){
 if(g.phase!=='event'||!g.pendingScenario)throw Error('There is no event to cancel.');
 const p=g.players[g.turn],card=scenarioCards.find(c=>c.id===cardId);
 if(!card||card.effect!=='cancel-event'||!p.hand.includes(cardId))throw Error('Choose a held birthday or Christmas card.');
 p.hand.splice(p.hand.indexOf(cardId),1);discardScenario(g,cardId);discardScenario(g,g.pendingScenario);log(g,`${p.name} cancelled the event with ${card.title}.`);g.pendingScenario=null;g.pendingRoad=null;g.phase=resumeAfterCard(g);
}
function startQuestion(g:Game,id:number){const card=cards.find(c=>c.id===id)!;g.pending=id;g.pendingDestination=null;g.destinationChoiceReturnPhase=null;g.pendingQuestion=card.questions[Math.floor(Math.random()*card.questions.length)]||'Share one thing you know about this place.';g.questionDeadline=Date.now()+60000;g.phase='question';g.left=0;log(g,`${g.players[g.turn].name} chose to play ${card.name}. Trivia starts now: 60 seconds.`)}
function askToPlayDestination(g:Game,id:number,returnPhase:'move'|'roll'|'end'){g.pendingDestination=id;g.destinationChoiceReturnPhase=returnPhase;g.phase='destination-choice';}
function distanceOnRoad(from:string,to:string,road:Road){if(from===to)return 0;const queue:[string,number][]=[[from,0]],seen=new Set([from]);for(let i=0;i<queue.length;i++){const [id,n]=queue[i];for(const e of neighbors(id).filter(edge=>edge.road===road)){if(e.to===to)return n+1;if(!seen.has(e.to)){seen.add(e.to);queue.push([e.to,n+1]);}}}return Infinity}
function maybeQuestionAtCurrentSpace(g:Game,returnPhase:'move'|'roll'|'end'='move'){const p=g.players[g.turn],id=p.cards.find(cardId=>!p.visited.includes(cardId)&&destinationHubs(cardId).includes(p.pos));if(id!==undefined){askToPlayDestination(g,id,returnPhase);return true}return false}
export function chooseDestination(g:Game,play:boolean){
 if(g.phase!=='destination-choice'||g.pendingDestination===null)throw Error('There is no destination card to choose.');
 const id=g.pendingDestination,returnPhase=g.destinationChoiceReturnPhase??'move';
 const p=g.players[g.turn];if(p.visited.includes(id)||!p.cards.includes(id)||!destinationHubs(id).includes(p.pos))throw Error('That destination card is not available here.');
 if(play){startQuestion(g,id);return;}
 g.pendingDestination=null;g.destinationChoiceReturnPhase=null;g.phase=returnPhase;
 if(returnPhase==='end'){endTurn(g);return;}
 if(returnPhase==='move'){if(g.left<=0||(!allowed(g).length&&!roadChangeOptions(g).length))endTurn(g);}
}
export function resolveScenario(g:Game,choice:string|undefined,validBlackDots:ReadonlySet<string>=knownBlackDotLocations){
 if(g.phase!=='event'||!g.pendingScenario)throw Error('There is no immediate scenario to resolve.');
 const id=g.pendingScenario,card=scenarioCards.find(c=>c.id===id)!;const p=g.players[g.turn],returnPhase=g.cardDrawReturnPhase??'move';let ends=false,checkArrival=false;
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
  case 'add-two':if(returnPhase==='roll')g.nextRollBonus+=2;else g.left+=2;break;
  case 'snowstorm':if(returnPhase==='roll')g.halveNextRoll=true;else g.left=Math.ceil(g.left/2);break;
  case 'speeding-ticket':{const held=choice&&p.hand.includes(choice)?choice:p.hand[0];if(held){p.hand.splice(p.hand.indexOf(held),1);discardScenario(g,held);}break;}
  case 'move-cone':{const all=g.players.flatMap(owner=>owner.cones.map(key=>({owner,key})));if(all.length){const moved=all[Math.floor(Math.random()*all.length)],used=new Set(g.players.flatMap(player=>player.cones)),open=[...validBlackDots].filter(dot=>!used.has(dot));if(open.length)moved.owner.cones[moved.owner.cones.indexOf(moved.key)]=open[Math.floor(Math.random()*open.length)];}break;}
  case 'business-trip':{const destination=p.cards.find(cardId=>!p.visited.includes(cardId));if(destination){const colleague=Number.isInteger(selected)&&selected!==g.turn?selected:left;g.players[colleague].pos=destinations.find(d=>d.id===destination)!.hub;g.pendingScenario=null;discardScenario(g,id);g.pendingRoad=null;g.cardDrawReturnPhase=null;startQuestion(g,destination);return;}break;}
  case 'slow-driver':p.slowRoad=g.pendingRoad??p.road;break;
  case 'stay-put':ends=true;break;
  case 'extra-turn':p.extraTurns++;break;
  case 'electric-car':p.electricRoad=p.road;break;
  case 'new-car':p.doubleTurn=true;break;
  default:break;
 }
 discardScenario(g,id);g.pendingScenario=null;g.pendingRoad=null;g.cardDrawReturnPhase=null;
 if(checkArrival&&maybeQuestionAtCurrentSpace(g,ends?'end':returnPhase))return;
 if(ends){log(g,`${p.name} ends the turn because of ${card.title}.`);endTurn(g);return;}
 g.phase=returnPhase;
}
export function nearbyCones(g:Game){const pos=g.players[g.turn].pos;return edges.filter(e=>(e.a===pos&&g.players.some(p=>p.cones.includes(e.b)||p.cones.includes(edgeKey(e.a,e.b))))||(e.b===pos&&g.players.some(p=>p.cones.includes(e.a)||p.cones.includes(edgeKey(e.a,e.b))))).map(e=>e.a===pos?e.b:e.a).filter((id,index,list)=>list.indexOf(id)===index);}
export function dismissConstructionChoice(g:Game){if(g.phase!=='move'||!nearbyCones(g).length)throw Error('There is no nearby construction zone to dismiss.');g.constructionPromptDismissed=true;}
export function passConstruction(g:Game,dotId:string,cardId?:string){
 const p=g.players[g.turn],edge=edges.find(item=>(item.a===p.pos&&item.b===dotId)||(item.b===p.pos&&item.a===dotId));
 if(g.phase!=='move'||!edge||!nearbyCones(g).includes(dotId))throw Error('Choose a construction zone beside your current dot.');
 if(p.road&&p.road!==edge.road)throw Error(`This cone is on a ${edge.road} road. Change road types before passing through it.`);
 if(cardId){const card=scenarioCards.find(item=>item.id===cardId);if(!card||card.effect!=='construction-pass'||!p.hand.includes(cardId))throw Error('Choose a held Construction Pass.');p.hand.splice(p.hand.indexOf(cardId),1);discardScenario(g,cardId);if(g.roll!==5)p.passCount++;log(g,`${p.name} played a Construction Pass to get through the cone.`);}
 else if(g.roll===6)g.constructionChoiceMade=true;
 else if(g.roll!==5&&p.passCount<1)throw Error('You need a 5, a 6, or a Construction Pass to get through this cone.');
 return move(g,edge.a===p.pos?edge.b:edge.a,g.roll!==6||!!cardId);
}
export function stayOnRoad(g:Game){if(g.phase!=='move'||!g.roadChoicePending)throw Error('There is no road type choice waiting.');g.roadChoicePending=false;g.roadChangeDot=null;g.roadChangeType=null;}
export function beginConeMove(g:Game,dotId:string){
 if(g.phase!=='move'||g.roll!==6)throw Error('Roll a six during your turn to move a cone.');
 if(g.coneMovedThisTurn)throw Error('You can move only one cone per turn.');
 if(!nearbyCones(g).includes(dotId))throw Error('You can only move a cone on a black dot beside your car.');
 g.coneToMove=dotId;g.phase='relocate';
}
export function relocateCone(g:Game,dotId:string,validBlackDots:ReadonlySet<string>){
 if(g.phase!=='relocate'||!g.coneToMove)throw Error('Choose a cone to move first.');
 if(!spaces[dotId]||!validBlackDots.has(dotId))throw Error('Cones can only be placed on black dots.');
 if(g.players.some(driver=>driver.cones.includes(dotId)))throw Error('That black dot already has a cone.');
 const owner=g.players.find(driver=>driver.cones.includes(g.coneToMove!));
 if(!owner)throw Error('That cone is no longer on the road.');
 owner.cones[owner.cones.indexOf(g.coneToMove)]=dotId;
 log(g,`${g.players[g.turn].name} moved a construction cone to a new black dot.`);
 g.coneToMove=null;g.coneMovedThisTurn=true;g.constructionChoiceMade=false;g.constructionPromptDismissed=false;g.phase='move';
}
export function placeCone(g:Game,dotId:string,validBlackDots:ReadonlySet<string>){
 if(g.phase!=='cones')throw Error('Cone placement is over.');
 const p=g.players[g.turn];
 if(!spaces[dotId]||!validBlackDots.has(dotId))throw Error('Cones can only be placed on black dots.');
 if(p.cones.length>=2)throw Error('You already placed both cones.');
 if(g.players.some(driver=>driver.cones.includes(dotId)))throw Error('A cone is already on that black dot.');
 p.cones.push(dotId);log(g,`${p.name} placed construction cone ${p.cones.length} of 2.`);
 if(p.cones.length<2)return;
 const next=Array.from({length:g.players.length-1},(_,i)=>(g.turn+i+1)%g.players.length).find(i=>g.players[i].cones.length<2);
 if(next!==undefined){g.turn=next;return;}
 g.turn=0;g.round=1;g.phase='roll';log(g,'All cones are placed. The road trip begins!');
}
export function endTurn(g:Game){
 const current=g.players[g.turn];g.left=0;current.doubleTurn=false;g.constructionChoiceMade=false;g.constructionPromptDismissed=false;g.roadChoicePending=false;g.roadChangeDot=null;g.roadChangeType=null;
 if(current.extraTurns>0){current.extraTurns--;g.phase='roll';drawDueRoadCard(g,current);return;}
 for(let tries=0;tries<g.players.length;tries++){
  g.turn=(g.turn+1)%g.players.length;if(g.turn===0)g.round++;
  const next=g.players[g.turn];if(next.skipTurns>0){next.skipTurns--;log(g,`${next.name} loses a turn to a scenario card.`);continue;}
  g.phase='roll';drawDueRoadCard(g,next);return;
 }
 g.phase='roll';
}
export function roll(g:Game,value=die()){
 if(g.phase!=='roll')throw Error('Finish the current turn first.');if(!Number.isInteger(value)||value<1||value>6)throw Error('Invalid die.');
 g.roll=value;const allowance=value+g.nextRollBonus;g.nextRollBonus=0;g.left=g.halveNextRoll?Math.ceil(allowance/2):allowance;g.halveNextRoll=false;g.coneMovedThisTurn=false;g.constructionChoiceMade=false;g.constructionPromptDismissed=false;g.roadChoicePending=false;g.roadChangeDot=null;g.roadChangeType=null;g.phase='move';log(g,`${g.players[g.turn].name} rolled ${value}.`);
 if(!allowed(g).length&&!roadChangeOptions(g).length&&!nearbyCones(g).length){log(g,'No open road: wait for another roll or take a different route next turn.');endTurn(g);}
}
export function move(g:Game,to:string,consumeSavedPass=true){
 const e=allowed(g).find(e=>e.to===to);if(!e)throw Error('That space is not available on this roll.');
 const p=g.players[g.turn],cost=moveCost(g,e);if(consumeSavedPass&&isConstruction(g,e)&&g.roll!==5&&p.passCount>0)p.passCount--;p.pos=to;p.road=e.road;g.left=Math.max(0,g.left-cost);g.constructionChoiceMade=false;g.constructionPromptDismissed=false;g.roadChoicePending=false;
 const destination=p.cards.find(id=>!p.visited.includes(id)&&destinationHubs(id).includes(to));
 if(destination){askToPlayDestination(g,destination,'move');return;}
 if(to===p.homeBase&&p.visited.length===p.cards.length){g.phase='won';g.winner=g.turn;log(g,`${p.name} reached home and wins the Tour of Utah!`);return;}
 if(g.left<=0||(!allowed(g).length&&!roadChangeOptions(g).length))endTurn(g);
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
export function botTurn(g:Game,validBlackDots:ReadonlySet<string>=knownBlackDotLocations){
 if(!g.players[g.turn].bot||g.phase==='lobby'||g.phase==='won')return;
 if(g.phase==='destination-choice'){chooseDestination(g,true);return;}
 if(g.phase==='card-reveal'){if(g.pendingScenario)keepCardPrivate(g,g.pendingScenario);return;}
 if(g.phase==='cones'){
  while(g.players[g.turn].bot&&g.phase==='cones'){
   const used=new Set(g.players.flatMap(player=>player.cones));const open=[...validBlackDots].filter(id=>!used.has(id));
   if(!open.length)throw Error('No open black dots remain for cone placement.');
   placeCone(g,open[Math.floor(Math.random()*open.length)],validBlackDots);
  }
  return;
 }
 if(g.phase==='event'){resolveScenario(g,undefined,validBlackDots);return;}
 if(g.phase==='hand'){const incoming=g.pendingScenario;if(incoming)discardHeldCard(g,g.players[g.turn].hand[0]??incoming);return;}
 if(g.phase==='relocate'){const used=new Set(g.players.flatMap(player=>player.cones));const open=[...validBlackDots].find(id=>!used.has(id));if(open)relocateCone(g,open,validBlackDots);return;}
 if(g.phase==='question'){answer(g,true);return;}
 const turn=g.turn;const p=g.players[turn];const targets=p.cards.filter(id=>!p.visited.includes(id)).map(id=>destinationHubs(id).sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0]);if(!targets.length)targets.push(p.homeBase);
 const target=targets.sort((a,b)=>distance(p.pos,a)-distance(p.pos,b))[0];if(g.phase==='roll')roll(g);
 let steps=0;while(g.turn===turn&&g.phase==='move'&&steps++<6){
  let options=allowed(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target));
  if(!options.length&&g.roll===6&&!g.coneMovedThisTurn&&nearbyCones(g).length){const dot=nearbyCones(g)[0],used=new Set(g.players.flatMap(player=>player.cones));const open=[...validBlackDots].find(id=>!used.has(id));if(open){beginConeMove(g,dot);relocateCone(g,open,validBlackDots);continue;}}
  if(!options.length&&nearbyCones(g).length&&(g.roll===5||g.roll===6||p.passCount>0)){if(g.roll===6)g.constructionChoiceMade=true;options=allowed(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target));}
  if(!options.length&&roadChangeOptions(g).length){const road=roadChangeOptions(g).sort((a,b)=>distance(a.to,target)-distance(b.to,target))[0].road;changeRoad(g,road);if(g.phase!=='move')break;continue;}
  if(!options.length||distance(options[0].to,target)>=distance(p.pos,target)){endTurn(g);break;}move(g,options[0].to);
 }
}
