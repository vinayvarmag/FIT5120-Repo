/* GET /api/event/all  →  every event in the system */
import { NextResponse } from "next/server";
import pool from "../../db";            //  ← same pool you already use

export async function GET() {
    try {
        const [rows] = await pool.query(
            `SELECT  e.*,
                     v.venue_name
               FROM  EVENT e
               LEFT JOIN VENUE v ON v.venue_id = e.venue_id
              ORDER BY e.event_startdatetime`
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET /api/event/all", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
