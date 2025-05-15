// File: src/app/api/event/[id]/route.js
import { NextResponse } from "next/server";
import pool from "../../db";
import { requireUserId } from "@/lib/auth";

/* helper – fetch one event the caller owns */
async function fetchEvent(user_id, event_id) {
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
     WHERE event_id = ? AND user_id = ?`,
        [event_id, user_id]
    );
    return rows[0];
}

/* ─── GET  /api/event/[id] ─── */
export async function GET(_, { params }) {
    const user_id = await requireUserId();
    const { event_id } = params;
    const event = await fetchEvent(user_id, event_id);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
}

/* ─── PUT  /api/event/[id] ─── */
export async function PUT(request, { params }) {
    const user_id = await requireUserId();
    const { event_id } = params;
    const {
        event_title,
        event_description,
        event_startdatetime,
        event_enddatetime,
        event_budget,
        venue_place_id,
        venue_name,
        venue_address,
    } = await request.json();

    const [result] = await pool.query(
        `UPDATE EVENT
       SET event_title        = ?,
           event_description  = ?,
           event_startdatetime= ?,
           event_enddatetime  = ?,
           event_budget       = ?,
           venue_place_id     = ?,
           venue_name         = ?,
           venue_address      = ?
     WHERE event_id = ? AND user_id = ?`,
        [
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            event_budget,
            venue_place_id,
            venue_name,
            venue_address,
            event_id,
            user_id,
        ]
    );

    if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(await fetchEvent(user_id, event_id));
}

/* ─── DELETE  /api/event/[id] ─── */
export async function DELETE(_, { params }) {
    const user_id = await requireUserId();
    const { event_id } = params;

    const [result] = await pool.query(
        "DELETE FROM EVENT WHERE event_id = ? AND user_id = ?",
        [event_id, user_id]
    );
    if (result.affectedRows === 0) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
