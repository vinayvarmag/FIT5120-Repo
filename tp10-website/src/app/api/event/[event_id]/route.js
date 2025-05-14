import { NextResponse } from "next/server";
import pool from "../../db";
import { requireUserId } from "@/lib/auth";

/* helper – fetch one event the caller owns */
async function fetchEvent(user_id, event_id) {
    const [rows] = await pool.query(
        `SELECT e.*, v.venue_name
         FROM EVENT e
                  LEFT JOIN VENUE v ON v.venue_id = e.venue_id
         WHERE e.event_id = ? AND e.user_id = ?`,
        [event_id, user_id],
    );
    return rows[0];
}

/* ─── GET  /api/event/[id] ─── */
export async function GET(_, { params }) {
    const user_id   = await requireUserId();
    const { event_id } = params;
    const event = await fetchEvent(user_id, event_id);
    if (!event)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
}

/* ─── PUT  /api/event/[id] ─── */
export async function PUT(request, { params }) {
    const user_id   = await requireUserId();
    const { event_id } = params;

    const {
        event_title,
        event_description,
        event_startdatetime,
        event_enddatetime,
        venue_id,
        event_budget,
    } = await request.json();

    /* update only if owner */
    const [result] = await pool.query(
        `UPDATE EVENT
            SET event_title        = ?,
                event_description  = ?,
                event_startdatetime= ?,
                event_enddatetime  = ?,
                venue_id           = ?,
                event_budget       = ?
          WHERE event_id = ? AND user_id = ?`,
        [
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            venue_id ?? null,
            event_budget,
            event_id,
            user_id,
        ],
    );

    if (result.affectedRows === 0)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json(await fetchEvent(user_id, event_id));
}

/* ─── DELETE  /api/event/[id] ─── */
export async function DELETE(_, { params }) {
    const user_id   =  await requireUserId();
    const { event_id } = params;

    const [result] = await pool.query(
        "DELETE FROM EVENT WHERE event_id = ? AND user_id = ?",
        [event_id, user_id],
    );
    if (result.affectedRows === 0)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
