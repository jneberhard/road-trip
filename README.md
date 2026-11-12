# Tour of Utah

A Utah road trip game for one to eight human and computer drivers. Players visit the randomly dealt destinations, answer trivia at each stop, and return to Salt Lake City. The game includes the supplied 80 destination cards and 479 questions.

## Run locally

Requires Node.js 22 or newer.

```sh
pnpm install
pnpm dev
```

Local computer games work without a database. To test online rooms, create a Neon Postgres database, set `DATABASE_URL` in the environment, apply the schema with `pnpm db:migrate`, then use **Create online room**.

## Deploy to Vercel

1. Import `jneberhard/road-trip` in Vercel and set the project root to the repository root.
2. Connect a Neon database from Vercel Marketplace. It should add `DATABASE_URL` to the Vercel project’s environment variables.
3. Set the Vercel Framework Preset to **Other** if the project still has the Next.js preset selected. Use the `pnpm build` command in `vercel.json` and leave Output Directory unset so Vercel can use Nitro’s generated `.vercel/output` Build Output API manifest.
4. Deploy. The Vercel build uses Vinext with Nitro’s Vercel adapter; online game rooms use Neon Postgres.
5. Apply both SQL migrations in `drizzle-postgres/` to the Neon database. You can run `pnpm db:migrate` with `DATABASE_URL` set locally, or run `0000_luxuriant_shaman.sql` followed by `0001_global_map_settings.sql` in the Neon SQL editor.
6. To enable the shared map editor, add `MAP_ADMIN_PASSWORD` as a Vercel environment variable for Production (and Preview if needed), then redeploy. Open `/admin/map`, sign in with that password, drag map dots or recolor road segments, and choose **Save for deployed game**. Saved map settings are stored in Neon and appear in game boards automatically.

The migrations create the `rooms` and `map_settings` tables. Game room state and the shared admin map are stored in Neon. Do not commit a database connection string or the map admin password.

## Rules and source cards

The printable rule book is at `/rules`. The board is schematic and intended for playtesting, not navigation. Destination questions do not include an answer key, so players judge responses together.
