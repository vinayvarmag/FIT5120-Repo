// File: src/app/api/event/all/route.js
import { NextResponse } from "next/server";
import pool from "../../db";

/* GET /api/event/all  →  every event in the system (no JOIN with VENUE) */
export async function GET() {
    try {
        const [rows] = await pool.query(
            `SELECT
                 event_id,
                 user_id,
                 event_title,
                 event_description,
                 event_startdatetime,
                 event_enddatetime,
                 event_budget,
                 venue_place_id,
                 venue_name,
                 venue_address
             FROM EVENT
             ORDER BY event_startdatetime`
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET /api/event/all", err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
