// src/app/api/data/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Pool } from "pg";          // pooled connections are faster

// ── keep a single pool for every request ───────────────────────
const pool = new Pool({ connectionString: process.env.PG_CONN });

export async function GET(req) {
    /* which dataset? fallback = Birthplace */
    const dataset =
        new URL(req.url).searchParams.get("dataset") ?? "Birthplace";

    /* SQL text for each dataset -------------------------------- */
    const sqlMap = {
        Birthplace: `
            SELECT  l.location_name AS region,
                    c.country_name  AS value,
                    bl.birthplace_location_count AS count
            FROM    public.birthplace bl
                        JOIN    public.location  l ON l.location_id = bl.location_id
                        JOIN    public.country   c ON c.country_id  = bl.country_id;`,

        Language: `
            SELECT  l.location_name AS region,
                    lg.language_name AS value,
                    ll.language_location_count AS count
            FROM    public.language_location ll
                        JOIN    public.location  l  ON l.location_id  = ll.location_id
                        JOIN    public.language lg ON lg.language_id = ll.language_id;`,

        Religion: `
            SELECT  l.location_name AS region,
                    r.religion_name  AS value,
                    rl.religion_location_count AS count
            FROM    public.religion_location rl
                        JOIN    public.location  l ON l.location_id = rl.location_id
                        JOIN    public.religion r ON r.religion_id  = rl.religion_id;`
    };

    const sql = sqlMap[dataset];
    if (!sql) {
        return NextResponse.json(
            { error: "Unknown dataset" },
            { status: 400 }
        );
    }

    try {
        const { rows } = await pool.query(sql);
        return NextResponse.json({ rows });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "DB query failed" },
            { status: 500 }
        );
    }
}
