import { NextResponse } from "next/server";
import pool from "../db";

export async function PUT(request) {
    try {
        const { event_id, participant_id, rsvp_status } = await request.json();

        if (!event_id || !participant_id) {
            return NextResponse.json(
                { error: "Missing event_id or participant_id" },
                { status: 400 }
            );
        }

        await pool.query(
            "UPDATE EVENT_PARTICIPANT SET rsvp_status = ? WHERE event_id = ? AND participant_id = ?",
            [rsvp_status, event_id, participant_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating RSVP status:", error);
        return NextResponse.json(
            { error: "Failed to update RSVP status" },
            { status: 500 }
        );
    }
}
