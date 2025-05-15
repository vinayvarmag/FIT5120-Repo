// File: src/app/api/event/route.js
import { NextResponse } from "next/server";
import pool from "../db";
import { requireUserId } from "@/lib/auth";

/* ─── GET /api/event ──
   Returns caller’s events, or [] if not logged in.
   No join to VENUE; uses venue_place_id, venue_name, venue_address.
*/
export async function GET() {
    try {
        const user_id = await requireUserId();
        if (!user_id) return NextResponse.json([]);

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
             WHERE user_id = ?
             ORDER BY event_startdatetime`,
            [user_id]
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Error fetching events:", err);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

/* ─── POST /api/event ──
   Creates a new event with Google Places venue fields.
*/
export async function POST(request) {
    try {
        const user_id = await requireUserId();

        const {
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            venue_place_id,
            venue_name,
            venue_address,
            event_budget = 0,
        } = await request.json();

        const [result] = await pool.query(
            `INSERT INTO EVENT
             (user_id, event_title, event_description, event_startdatetime,
              event_enddatetime, venue_place_id, venue_name, venue_address, event_budget)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                event_title,
                event_description,
                event_startdatetime,
                event_enddatetime,
                venue_place_id ?? null,
                venue_name ?? null,
                venue_address ?? null,
                event_budget,
            ]
        );

        const [createdRows] = await pool.query(
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
       WHERE event_id = ?`,
            [result.insertId]
        );

        return NextResponse.json(createdRows[0], { status: 201 });
    } catch (err) {
        if (err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "Login required" }, { status: 401 });
        }
        console.error("Error creating event:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
