import {env} from 'cloudflare:workers';
import {createGame,roll,move,endTurn,botTurn,answer,type Game} from '../../../lib/game';
export const dynamic='force-dynamic';
function publicGame(g:Game){return {...g,host:undefined,players:g.players.map(p=>({...p,token:undefined}))};}
function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){
 try{
 const b=await req.json() as {action:string;humans:number;bots:number;name?:string;code?:string;token?:string;rev?:number;to:string;correct:boolean};const db=env.DB;if(!db)return response({error:'Online rooms are unavailable. Local play is still available.'},503);
 if(b.action==='create'){
  const g=createGame(b.humans,b.bots,String(b.name||'Host').slice(0,24),true);const token=crypto.randomUUID();g.players[0].token=token;g.host=token;
  for(let i=0;i<5;i++){const bytes=crypto.getRandomValues(new Uint8Array(6));const code=Array.from(bytes,x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%32]).join('');
   const result=await db.prepare('INSERT OR IGNORE INTO rooms(code,state,rev,updated) VALUES(?,?,0,?)').bind(code,JSON.stringify(g),Date.now()).run();if(result.meta.changes)return response({code,token,seat:0,game:publicGame(g)});
  }throw Error('Please try creating a room again.');
 }
 const code=String(b.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))throw Error('Enter a six-character game code.');
 const row=await db.prepare('SELECT state,rev FROM rooms WHERE code=?').bind(code).first<{state:string;rev:number}>();if(!row)return response({error:'Game code not found.'},404);
 const g:Game=JSON.parse(row.state);let seat=g.players.findIndex(p=>p.token&&p.token===b.token);let token=b.token;
 if(b.action==='join'){
  if(seat<0){if(g.phase!=='lobby')throw Error('This game has already started.');seat=g.players.findIndex(p=>!p.bot&&!p.token);if(seat<0)throw Error('This room is full.');token=crypto.randomUUID();g.players[seat].token=token;g.players[seat].name=String(b.name||'Driver').slice(0,24);}
 }else{
  if(seat<0)return response({error:'Join this room before playing.'},403);
  if(b.action==='get')return response({game:publicGame(g),seat});
  if(b.rev!==row.rev)return response({error:'The game changed. Please try again.',game:publicGame(g)},409);
  if(b.action==='start'){if(b.token!==g.host)throw Error('Only the host can start.');if(g.phase!=='lobby')throw Error('Game already started.');if(g.players.some(p=>!p.bot&&!p.token))throw Error('Wait for all human drivers to join.');g.phase='roll';}
  else if(b.action==='bot'){if(!g.players[g.turn].bot)throw Error('It is a human turn.');botTurn(g);}
  else{if(seat!==g.turn)throw Error('It is another driver’s turn.');if(b.action==='roll')roll(g);else if(b.action==='move')move(g,b.to);else if(b.action==='end'){if(g.phase!=='move')throw Error('Roll before ending your turn.');endTurn(g);}else if(b.action==='answer')answer(g,b.correct);else throw Error('Unknown action.');}
 }
 g.rev=row.rev+1;const result=await db.prepare('UPDATE rooms SET state=?,rev=?,updated=? WHERE code=? AND rev=?').bind(JSON.stringify(g),g.rev,Date.now(),code,row.rev).run();if(!result.meta.changes)return response({error:'Another player just updated the room. Try again.'},409);
 return response({game:publicGame(g),seat,token,code});
 }catch(e){return response({error:e instanceof Error?e.message:'Unable to update the game.'},400);}
}

