import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { rooms } from "../../../db/schema";
import { answer, botTurn, createGame, endTurn, move, roll, type Game } from "../../../lib/game";

export const dynamic = "force-dynamic";

type Action = {
  action: string;
  humans?: number;
  bots?: number;
  name?: string;
  code?: string;
  token?: string;
  rev?: number;
  to?: string;
  correct?: boolean;
};

function publicGame(game: Game) {
  return { ...game, host: undefined, players: game.players.map(({ token: _, ...player }) => player) };
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
      const game = createGame(body.humans ?? 1, body.bots ?? 0, (body.name || "Host").slice(0, 24), true);
      const token = crypto.randomUUID();
      game.players[0].token = token;
      game.host = token;
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = makeCode();
        const inserted = await db.insert(rooms).values({ code, state: game }).onConflictDoNothing().returning({ code: rooms.code });
        if (inserted.length) return response({ code, token, seat: 0, game: publicGame(game) });
      }
      throw new Error("Please try creating a room again.");
    }

    const code = (body.code || "").toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) throw new Error("Enter a six-character game code.");
    const [row] = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    if (!row) return response({ error: "Game code not found." }, 404);
    const game = row.state;
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
      if (body.action === "get") return response({ game: publicGame(game), seat });
      if (body.rev !== row.rev) return response({ error: "The game changed. Please try again.", game: publicGame(game) }, 409);
      if (body.action === "start") {
        if (body.token !== game.host) throw new Error("Only the host can start.");
        if (game.phase !== "lobby") throw new Error("Game already started.");
        if (game.players.some((player) => !player.bot && !player.token)) throw new Error("Wait for all human drivers to join.");
        game.phase = "roll";
      } else if (body.action === "bot") {
        if (!game.players[game.turn].bot) throw new Error("It is a human turn.");
        botTurn(game);
      } else {
        if (seat !== game.turn) throw new Error("It is another driver’s turn.");
        if (body.action === "roll") roll(game);
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
    return response({ game: publicGame(game), seat, token, code });
  } catch (error) {
    return response({ error: error instanceof Error ? error.message : "Unable to update the game." }, 400);
  }
}
