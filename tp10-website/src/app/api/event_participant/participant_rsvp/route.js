import { NextResponse } from "next/server";
import pool from "../../db";

/* ────────────────────────────────────────────────────────────
   PUT  /api/participant_rsvp
   body { event_id, participant_id, rsvp_status }
──────────────────────────────────────────────────────────────── */
export async function PUT(req) {
    try {
        const { event_id, participant_id, rsvp_status } = await req.json();

        const [result] = await pool.query(
            `UPDATE EVENT_PARTICIPANT
          SET rsvp_status = ?
        WHERE event_id = ? AND participant_id = ?`,
            [rsvp_status, event_id, participant_id]
        );

        if (result.affectedRows === 0)
            return NextResponse.json({ error: "Link not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error updating RSVP:", err);
        return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
    }
}
