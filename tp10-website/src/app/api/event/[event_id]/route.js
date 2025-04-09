import { NextResponse } from "next/server";
import pool from "../../db";

export async function PUT(request, { params }) {
    // Await the params before using them
    const { event_id } = await params;
    try {
        // Expect JSON body with updated event data including venue_id.
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
             SET event_title = ?,
                 event_description = ?,
                 event_startdatetime = ?,
                 event_enddatetime = ?,
                 venue_id = ?,
                 event_budget = ?
             WHERE event_id = ?`,
            [event_title, event_description, event_startdatetime, event_enddatetime, venue_id, event_budget, event_id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}
