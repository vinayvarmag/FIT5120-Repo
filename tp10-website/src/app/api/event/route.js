import { NextResponse } from "next/server";
import pool from "../db";

/* ─── GET  /api/event  → list every event with venue name ─── */
export async function GET() {
    try {
        const [rows] = await pool.query(
            `SELECT e.*,
                    v.venue_name
             FROM EVENT e
                      LEFT JOIN VENUE v ON v.venue_id = e.venue_id
             ORDER BY e.event_startdatetime`
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Error fetching events:", err);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

/* ─── POST /api/event  → create a new event ─── */
export async function POST(request) {
    try {
        const {
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            venue_id,
            event_budget = 0,
        } = await request.json();

        const [result] = await pool.query(
            `INSERT INTO EVENT
         (event_title, event_description, event_startdatetime,
          event_enddatetime, venue_id, event_budget)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                event_title,
                event_description,
                event_startdatetime,
                event_enddatetime,
                venue_id ?? null,
                event_budget,
            ]
        );

        const [created] = await pool.query("SELECT * FROM EVENT WHERE event_id = ?", [
            result.insertId,
        ]);
        return NextResponse.json(created[0], { status: 201 });
    } catch (err) {
        console.error("Error creating event:", err);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
