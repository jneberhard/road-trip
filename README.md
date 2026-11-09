# Tour of Utah

A Utah road trip game for one to eight human and computer drivers. Players visit the randomly dealt destinations, answer trivia at each stop, and return to Salt Lake City. The game includes the supplied 80 destination cards and 479 questions.

## Run locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Local computer games work without a database. To test online rooms, create a Neon Postgres database, set `DATABASE_URL` in the environment, apply the schema with `npm run db:migrate`, then use **Create online room**.

## Deploy to Vercel

1. Import `jneberhard/road-trip` in Vercel and set the project root to the repository root.
2. Connect a Neon database from Vercel Marketplace. It should add `DATABASE_URL` to the Vercel project’s environment variables.
3. Set the Vercel Framework Preset to **Other** if the project still has the Next.js preset selected. Use the `npm run build` command in `vercel.json` and leave Output Directory unset so Vercel can use Nitro’s generated `.vercel/output` Build Output API manifest.
4. Deploy. The Vercel build uses Vinext with Nitro’s Vercel adapter; online game rooms use Neon Postgres.
5. Apply `drizzle-postgres/0000_luxuriant_shaman.sql` to the Neon database once. You can run `npm run db:migrate` with `DATABASE_URL` set locally, or use the Neon SQL editor.

The migration creates the `rooms` table. Game room state is stored as JSONB, and revision-checked updates prevent concurrent moves from silently overwriting one another. Do not commit a database connection string.

## Rules and source cards

The printable rule book is at `/rules`. The board is schematic and intended for playtesting, not navigation. Destination questions do not include an answer key, so players judge responses together.
