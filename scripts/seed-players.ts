import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import postgres from "postgres";
import { z } from "zod";
import { normalizePhoneNumber } from "../src/lib/ingestion";

dotenv.config({ path: ".env.local" });

const playerSchema = z.array(
  z.object({
    displayName: z.string().trim().min(1),
    phone: z.string().trim().min(8),
  }),
).min(1);

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is missing from .env.local");

const filePath = resolve(process.argv[2] || "config/players.local.json");
const players = playerSchema.parse(JSON.parse(await readFile(filePath, "utf8")));
const sql = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  await sql.begin(async (transaction) => {
    for (const [index, player] of players.entries()) {
      const phone = normalizePhoneNumber(player.phone);
      if (!phone) throw new Error(`Invalid phone for ${player.displayName}`);
      const slug = slugify(player.displayName);
      if (!slug) throw new Error(`Could not create a slug for ${player.displayName}`);

      const rows = await transaction<{ id: string }[]>`
        insert into public.players (slug, display_name, display_order)
        values (${slug}, ${player.displayName}, ${index + 1})
        on conflict (slug) do update set
          display_name = excluded.display_name,
          display_order = excluded.display_order,
          active = true
        returning id
      `;
      await transaction`
        insert into private.player_identifiers (player_id, phone_e164)
        values (${rows[0].id}::uuid, ${phone})
        on conflict (phone_e164) do update set player_id = excluded.player_id
      `;
    }
  });
  console.log(`Seeded ${players.length} players from ${filePath}`);
} finally {
  await sql.end();
}
