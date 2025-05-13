import { NextResponse } from "next/server";
import pool from "../../db";          // one level further up!

/* helper – fetch one */
async function fetchEvent(event_id) {
    const [rows] = await pool.query(
        `SELECT e.*,
            v.venue_name
       FROM EVENT e
  LEFT JOIN VENUE v ON v.venue_id = e.venue_id
      WHERE e.event_id = ?`,
        [event_id]
    );
    return rows[0];
}

/* ─── GET  /api/event/[event_id]  → single event ─── */
export async function GET(_, { params }) {
    const { event_id } = await params;
    const event = await fetchEvent(event_id);
    if (!event)
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(event);
}

/* ─── PUT  /api/event/[event_id]  → update ─── */
export async function PUT(request, { params }) {
    const { event_id } = params;

    try {
        const {
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            venue_id,
            event_budget,
        } = await request.json();

        const [result] = await pool.query(
            `UPDATE EVENT
          SET event_title        = ?,
              event_description  = ?,
              event_startdatetime= ?,
              event_enddatetime  = ?,
              venue_id           = ?,
              event_budget       = ?
        WHERE event_id = ?`,
            [
                event_title,
                event_description,
                event_startdatetime,
                event_enddatetime,
                venue_id ?? null,
                event_budget,
                event_id,
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        return NextResponse.json(await fetchEvent(event_id));
    } catch (err) {
        console.error("Error updating event:", err);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

/* ─── DELETE  /api/event/[event_id]  → remove ─── */
export async function DELETE(_, { params }) {
    const { event_id } = await params;

    try {
        const [result] = await pool.query("DELETE FROM EVENT WHERE event_id = ?", [
            event_id,
        ]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error deleting event:", err);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
