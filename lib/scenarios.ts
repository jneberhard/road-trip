export type ScenarioEffect =
  | 'travel-friend' | 'go-to' | 'all-to' | 'home' | 'schools' | 'ski' | 'end-turn'
  | 'skip-two' | 'add-two' | 'speeding-ticket' | 'move-cone' | 'business-trip'
  | 'slow-driver' | 'stay-put' | 'extra-turn' | 'electric-car' | 'new-car'
  | 'switch-road' | 'construction-pass' | 'cancel-event';

export type ScenarioCard = {
  id: string;
  title: string;
  text: string;
  type: 'immediate' | 'hold';
  effect: ScenarioEffect;
  target?: string;
  group?: boolean;
  friend?: 'left' | 'choose';
};

export const scenarioCards: ScenarioCard[] = [
  {id:'balloon',title:'Bluff Balloon Festival',text:'You’ve won a ride in a hot air balloon. Travel to Bluff Balloon Festival and take a friend with you.',type:'immediate',effect:'travel-friend',target:'bluff',friend:'choose'},
  {id:'tuacahn',title:'Outdoor Musical',text:'You desire to see an outdoor musical. Go to Tuacahn Theatre and take any player with you.',type:'immediate',effect:'travel-friend',target:'george',friend:'choose'},
  {id:'jazz-playoff',title:'Jazz Playoff Game',text:'All players go to cheer on the team.',type:'immediate',effect:'all-to',target:'slc'},
  {id:'rafting',title:'Cataract Canyon',text:'The adventure awaits. Go river rafting in Cataract Canyon and take the person on your left.',type:'immediate',effect:'travel-friend',target:'canyon',friend:'left'},
  {id:'deer-valley',title:'Deer Valley Summer Concert',text:'You desire to see a concert. Go to a Deer Valley Summer Concert and take at least one player with you.',type:'immediate',effect:'travel-friend',target:'park',friend:'choose'},
  {id:'family-emergency',title:'Family Emergency',text:'Return to your home base.',type:'immediate',effect:'home'},
  {id:'college-football',title:'College Football Game',text:'It’s fall and time for a college football game. Send all players to schools of your choice, each going to a different school.',type:'immediate',effect:'schools',group:true},
  {id:'ski-day',title:'Free Ski Day',text:'Snowstorm hits and you are given a free ski day. Go to any ski resort.',type:'immediate',effect:'ski'},
  {id:'transmission',title:'Transmission Failure',text:'Skip 2 turns.',type:'immediate',effect:'skip-two'},
  {id:'flat-tire',title:'Flat Tire',text:'End your turn.',type:'immediate',effect:'end-turn'},
  {id:'dead-battery',title:'Dead Battery',text:'End your turn.',type:'immediate',effect:'end-turn'},
  {id:'state-fair',title:'Utah State Fair',text:'Attend the annual state fair. Go to the Utah Fairgrounds.',type:'immediate',effect:'go-to',target:'slc'},
  {id:'family-reunion',title:'Family Reunion',text:'All players gather to you.',type:'immediate',effect:'all-to',target:'current'},
  {id:'snowstorm',title:'Snowstorm',text:'You are slowed down and use more gas. Cut your remaining roll in half, rounded up.',type:'immediate',effect:'snowstorm'},
  {id:'oil-change',title:'Oil Change',text:'End your turn.',type:'immediate',effect:'end-turn'},
  {id:'traffic-accident',title:'Traffic Accident',text:'Skip 2 turns.',type:'immediate',effect:'skip-two'},
  {id:'ran-out-gas',title:'Ran Out of Gas',text:'Skip 2 turns.',type:'immediate',effect:'skip-two'},
  {id:'road-bonus-1',title:'Change Road',text:'Add 2 spaces to your roll.',type:'immediate',effect:'add-two'},
  {id:'road-bonus-2',title:'Change Road',text:'Add 2 spaces to your roll.',type:'immediate',effect:'add-two'},
  {id:'speeding-ticket',title:'Speeding Ticket',text:'Turn in one of your saved cards.',type:'immediate',effect:'speeding-ticket'},
  {id:'udot-finished-1',title:'UDOT Construction Finished',text:'One area of construction is over. Move that construction to a new area.',type:'immediate',effect:'move-cone'},
  {id:'udot-finished-2',title:'UDOT Construction Finished',text:'One area of construction is over. Move that construction to a new area.',type:'immediate',effect:'move-cone'},
  {id:'udot-finished-3',title:'UDOT Construction Finished',text:'One area of construction is over. Move that construction to a new area.',type:'immediate',effect:'move-cone'},
  {id:'business-trip',title:'Unexpected Business Trip',text:'You cannot attend but send one of your colleagues to go for you.',type:'immediate',effect:'business-trip'},
  {id:'slow-driver',title:'Slow Driver',text:'While on your new road you may not pass another player. You may stay even with them, but do not pass unless you are at a construction zone; then you may pass to get past the cone before the other player.',type:'immediate',effect:'slow-driver'},
  {id:'feeling-ill-1',title:'Feeling Ill',text:'Do not move from your current location.',type:'immediate',effect:'stay-put'},
  {id:'feeling-ill-2',title:'Feeling Ill',text:'Do not move from your current location.',type:'immediate',effect:'stay-put'},
  {id:'good-samaritan-1',title:'Good Samaritan',text:'Take 2 consecutive turns.',type:'immediate',effect:'extra-turn'},
  {id:'good-samaritan-2',title:'Good Samaritan',text:'Take 2 consecutive turns.',type:'immediate',effect:'extra-turn'},
  {id:'electric-vehicle',title:'New Electric Vehicle',text:'Double gas mileage while on your current type of road.',type:'immediate',effect:'electric-car'},
  {id:'new-car',title:'New Car Purchase',text:'Double gas mileage for 1 turn only.',type:'immediate',effect:'new-car'},
  {id:'change-road-1',title:'Change Road Card',text:'You may pass from one road to another without stopping or drawing a scenario card. Play anytime.',type:'hold',effect:'switch-road'},
  {id:'change-road-2',title:'Change Road Card',text:'You may pass from one road to another without stopping or drawing a scenario card. Play anytime.',type:'hold',effect:'switch-road'},
  {id:'construction-pass-1',title:'Construction Pass (Day Off)',text:'Hold this card to pass through one construction cone. You may not move the construction.',type:'hold',effect:'construction-pass'},
  {id:'construction-pass-2',title:'Construction Pass (Day Off)',text:'Hold this card to pass through one construction cone. You may not move the construction.',type:'hold',effect:'construction-pass'},
  {id:'construction-pass-3',title:'Construction Pass (Day Off)',text:'Hold this card to pass through one construction cone. You may not move the construction.',type:'hold',effect:'construction-pass'},
  {id:'christmas',title:'It’s Christmas',text:'Play to cancel any event card.',type:'hold',effect:'cancel-event'},
  {id:'birthday',title:'It’s Your Birthday',text:'Play to cancel any event card.',type:'hold',effect:'cancel-event'},
];
