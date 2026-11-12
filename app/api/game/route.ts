import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { rooms } from "../../../db/schema";
import { answer, beginConeMove, beginRoadChange, botTurn, cancelScenario, changeRoad, chooseDestination, confirmRoadChange, createGame, dismissCardReveal, discardHeldCard, dismissConstructionChoice, endTurn, hydrateGame, keepCardPrivate, move, passConstruction, placeCone, playChangeRoadCard, playConstructionPass, relocateCone, resolveScenario, roll, showCardToPlayer, startGame, stayOnRoad, type Game, type Road, type StopMix } from "../../../lib/game";
import { blackDotLocationIds } from "../../../lib/map-display";

export const dynamic = "force-dynamic";

type Action = {
  action: string;
  humans?: number;
  bots?: number;
  stopMix?: StopMix;
  name?: string;
  code?: string;
  token?: string;
  rev?: number;
  to?: string;
  edge?: string;
  targetEdge?: string;
  road?: Road;
  scenarioId?: string;
  choice?: string;
  correct?: boolean;
  confirm?: boolean;
  play?: boolean;
  recipientSeat?: number;
  revealId?: string;
};

function publicGame(game: Game, viewerSeat: number) {
  const visibleReveals=game.cardReveals.filter(reveal=>reveal.recipientSeat===viewerSeat&&game.players[reveal.ownerSeat]?.hand.includes(reveal.cardId));
  const privateChoice=viewerSeat!==game.turn&&['destination-choice','card-reveal','hand'].includes(game.phase);
  const visiblePhase=privateChoice?(game.phase==='destination-choice'?'move':'roll'):game.phase;
  return { ...game, host: undefined, phase:visiblePhase, pendingScenario:game.phase==='event'||viewerSeat===game.turn?game.pendingScenario:null, pendingDestination:viewerSeat===game.turn?game.pendingDestination:null, roadChoicePending:viewerSeat===game.turn?game.roadChoicePending:false, roadChangeDot:viewerSeat===game.turn?game.roadChangeDot:null, roadChangeType:viewerSeat===game.turn?game.roadChangeType:null, scenarioDeck:[], scenarioDiscard:[], cardReveals:visibleReveals, players: game.players.map(({ token: _, ...player },ownerSeat) => ({...player,hand:ownerSeat===viewerSeat?player.hand:player.hand.filter(cardId=>visibleReveals.some(reveal=>reveal.ownerSeat===ownerSeat&&reveal.cardId===cardId))})) };
}

function response(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => alphabet[byte % alphabet.length]).join("");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Action;
    const db = getDb();

    if (body.action === "create") {
      const game = createGame(body.humans ?? 1, body.bots ?? 0, (body.name || "Host").slice(0, 24), true, body.stopMix);
      const token = crypto.randomUUID();
      game.players[0].token = token;
      game.host = token;
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = makeCode();
        const inserted = await db.insert(rooms).values({ code, state: game }).onConflictDoNothing().returning({ code: rooms.code });
        if (inserted.length) return response({ code, token, seat: 0, game: publicGame(game,0) });
      }
      throw new Error("Please try creating a room again.");
    }

    const code = (body.code || "").toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) throw new Error("Enter a six-character game code.");
    const [row] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    if (!row) return response({ error: "Game code not found." }, 404);
    const game = hydrateGame(row.state as Game, blackDotLocationIds);
    let seat = game.players.findIndex((player) => player.token && player.token === body.token);
    let token = body.token;

    if (body.action === "join") {
      if (seat < 0) {
        if (game.phase !== "lobby") throw new Error("This game has already started.");
        const openSeat = game.players.findIndex((player) => !player.bot && !player.token);
        if (openSeat < 0) throw new Error("This room is full.");
        seat = openSeat;
        token = crypto.randomUUID();
        game.players[openSeat].token = token;
        game.players[openSeat].name = (body.name || "Driver").slice(0, 24);
      }
    } else {
      if (seat < 0) return response({ error: "Join this room before playing." }, 403);
      const timedOut = game.phase === "question" && game.questionDeadline !== null && Date.now() >= game.questionDeadline;
      if (body.action === "get") {
        if (timedOut) answer(game, false);
        else return response({ game: publicGame(game,seat), seat });
      } else if (body.action === "expire-question") {
        if (!timedOut) throw new Error("The trivia timer has not expired.");
        answer(game, false);
      } else if (body.rev !== row.rev) return response({ error: "The game changed. Please try again.", game: publicGame(game,seat) }, 409);
      else if (body.action === "dismiss-card-reveal") {
        if (!body.revealId) throw new Error("Choose a shared card to dismiss.");
        dismissCardReveal(game, body.revealId, seat);
      }
      else if (body.action === "start") {
        if (body.token !== game.host) throw new Error("Only the host can start.");
        if (game.phase !== "lobby") throw new Error("Game already started.");
        if (game.players.some((player) => !player.bot && !player.token)) throw new Error("Wait for all human drivers to join.");
        startGame(game);
      } else if (body.action === "bot") {
        if (!game.players[game.turn].bot) throw new Error("It is a human turn.");
        botTurn(game, blackDotLocationIds);
      } else {
        if (seat !== game.turn) throw new Error("It is another driver’s turn.");
        if (body.action === "cone") {
          if (!body.edge) throw new Error("Choose a black dot for your cone.");
          placeCone(game, body.edge, blackDotLocationIds);
        } else if (body.action === "begin-cone-move") {
          if (!body.edge) throw new Error("Choose a nearby cone to move.");
          beginConeMove(game, body.edge);
        } else if (body.action === "pass-construction") {
          if (!body.edge) throw new Error("Choose a construction zone to pass through.");
          passConstruction(game, body.edge, body.scenarioId);
        } else if (body.action === "dismiss-construction") {
          dismissConstructionChoice(game);
        } else if (body.action === "choose-destination") {
          chooseDestination(game, !!body.play);
        } else if (body.action === "begin-road-change") {
          if (!body.to || !body.road) throw new Error("Choose the dot and road type you want to use.");
          beginRoadChange(game, body.to, body.road);
        } else if (body.action === "confirm-road-change") {
          confirmRoadChange(game, !!body.confirm);
        } else if (body.action === "keep-card-private") {
          if (!body.scenarioId) throw new Error("Choose the newly drawn card.");
          keepCardPrivate(game, body.scenarioId);
        } else if (body.action === "show-card") {
          if (!body.scenarioId || body.recipientSeat===undefined) throw new Error("Choose a card and another driver.");
          showCardToPlayer(game, body.scenarioId, body.recipientSeat);
        } else if (body.action === "stay-road") {
          stayOnRoad(game);
        } else if (body.action === "relocate-cone") {
          if (!body.targetEdge) throw new Error("Choose a new black dot for the cone.");
          relocateCone(game, body.targetEdge, blackDotLocationIds);
        } else if (body.action === "switch-road") {
          if (!body.road) throw new Error("Choose a road type.");
          changeRoad(game, body.road);
        } else if (body.action === "play-change-road") {
          if (!body.road || !body.scenarioId) throw new Error("Choose a held Change Road Card and road type.");
          playChangeRoadCard(game, body.scenarioId, body.road);
        } else if (body.action === "play-construction-pass") {
          if (!body.scenarioId) throw new Error("Choose a held Construction Pass card.");
          playConstructionPass(game, body.scenarioId);
        } else if (body.action === "discard-held") {
          if (!body.scenarioId) throw new Error("Choose a card to discard.");
          discardHeldCard(game, body.scenarioId);
        } else if (body.action === "resolve-scenario") {
          resolveScenario(game, body.choice, blackDotLocationIds);
        } else if (body.action === "cancel-scenario") {
          if (!body.scenarioId) throw new Error("Choose a birthday or Christmas card.");
          cancelScenario(game, body.scenarioId);
        } else if (body.action === "roll") roll(game);
        else if (body.action === "move") {
          if (!body.to) throw new Error("Choose a road space.");
          move(game, body.to);
        } else if (body.action === "end") {
          if (game.phase !== "move") throw new Error("Roll before ending your turn.");
          endTurn(game);
        } else if (body.action === "answer") answer(game, !!body.correct);
        else throw new Error("Unknown action.");
      }
    }

    const [updated] = await db.update(rooms).set({ state: game, rev: row.rev + 1, updated: new Date() })
      .where(and(eq(rooms.code, code), eq(rooms.rev, row.rev))).returning({ rev: rooms.rev });
    if (!updated) return response({ error: "Another player just updated the room. Try again." }, 409);
    return response({ game: publicGame(game,seat), seat, token, code });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Unable to update the game." }, 400);
  }
}
