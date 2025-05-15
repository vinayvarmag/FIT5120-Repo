// File: src/app/api/user-event/route.js
import { NextResponse } from "next/server";
import pool from "../../db";          // adjust import if your db module path differs
import { requireUserId } from "@/lib/auth";

/* ─── GET  /api/user-event  →  list events the caller has saved ───────────────── */
export async function GET() {
    try {
        const user_id = await requireUserId();
        const [rows] = await pool.query(
            `SELECT
                 e.event_id,
                 e.user_id,
                 e.event_title,
                 e.event_description,
                 e.event_startdatetime,
                 e.event_enddatetime,
                 e.event_budget,
                 e.venue_place_id,
                 e.venue_name,
                 e.venue_address,
                 ue.user_favorite
             FROM USER_EVENT ue
                      JOIN EVENT       e ON e.event_id = ue.event_id
             WHERE ue.user_id = ?
             ORDER BY ue.user_favorite DESC, e.event_startdatetime`,
            [user_id]
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET /api/user-event", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── POST  /api/user-event  →  save/unsave (idempotent insert/update) ───────── */
export async function POST(request) {
    try {
        const { event_id, favorite = false } = await request.json();
        const user_id = await requireUserId();

        await pool.query(
            `INSERT INTO USER_EVENT (event_id, user_id, user_favorite)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE user_favorite = VALUES(user_favorite)`,
            [event_id, user_id, favorite]
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("POST /api/user-event", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── PATCH  /api/user-event  →  toggle favourite flag ─────────────────────────── */
export async function PATCH(request) {
    try {
        const { event_id, favorite } = await request.json();
        const user_id = await requireUserId();

        await pool.query(
            `UPDATE USER_EVENT
             SET user_favorite = ?
             WHERE event_id = ? AND user_id = ?`,
            [favorite, event_id, user_id]
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("PATCH /api/user-event", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── DELETE  /api/user-event?event_id=123  →  remove the saved link ───────────── */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = Number(searchParams.get("event_id"));
        const user_id  = await requireUserId();

        await pool.query(
            `DELETE FROM USER_EVENT WHERE event_id = ? AND user_id = ?`,
            [event_id, user_id]
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE /api/user-event", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
