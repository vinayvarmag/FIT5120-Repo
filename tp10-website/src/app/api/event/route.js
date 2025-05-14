// File: src/app/api/event/route.js
import { NextResponse } from "next/server";
import pool            from "../db";
import { getUserId, requireUserId } from "@/lib/auth";

/* ─── GET /api/event ──
   Returns caller’s events, or [] if not logged in.
   Never responds with 401, so Basic‑Auth middleware is not invoked.          */
export async function GET() {
    try {
        const user_id   = await requireUserId();           // null → not logged in
        if (!user_id) return NextResponse.json([]);   // just an empty list

        const [rows] = await pool.query(
            `SELECT e.*, v.venue_name
             FROM EVENT e
                      LEFT JOIN VENUE v ON v.venue_id = e.venue_id
             WHERE e.user_id = ?
             ORDER BY e.event_startdatetime`,
            [user_id],                         // ← placeholder
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.error("Error fetching events:", err);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 },
        );
    }
}

/* ─── POST /api/event ──
   Still requires a logged‑in user; unauthenticated calls return 401,
   which is fine because they originate from your app after login.           */
export async function POST(request) {
    try {
        const user_id   = await requireUserId();   // await is vital
        //console.log("userId =", user_id);         // throws if nobody logged in


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
             (user_id, event_title, event_description, event_startdatetime,
              event_enddatetime, venue_id, event_budget)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                event_title,
                event_description,
                event_startdatetime,
                event_enddatetime,
                venue_id ?? null,
                event_budget,
            ],
        );

        const [created] = await pool.query(
            "SELECT * FROM EVENT WHERE event_id = ?",
            [result.insertId],
        );

        return NextResponse.json(created[0], { status: 201 });
    } catch (err) {
        if (err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "Login required" }, { status: 401 });
        }
        console.error(err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
