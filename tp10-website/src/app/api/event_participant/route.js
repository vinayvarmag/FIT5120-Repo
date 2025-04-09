import { NextResponse } from "next/server";
import pool from "../db";

// POST: create the link event -> participant
export async function POST(request) {
    try {
        const { event_id, participant_id, rsvp_status = "Pending" } = await request.json();
        await pool.query(
            "INSERT INTO EVENT_PARTICIPANT (event_id, participant_id, rsvp_status) VALUES (?, ?, ?)",
            [event_id, participant_id, rsvp_status]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error linking participant to event:", error);
        return NextResponse.json({ error: "Failed to link participant to event" }, { status: 500 });
    }
}

// GET: retrieve participants linked to a given event, including RSVP
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");

        if (!event_id) {
            return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
        }

        // Include the RSVP status from EVENT_PARTICIPANT
        const [rows] = await pool.query(
            `SELECT p.*, ep.rsvp_status
             FROM PARTICIPANT p
                      JOIN EVENT_PARTICIPANT ep ON p.participant_id = ep.participant_id
             WHERE ep.event_id = ?`,
            [event_id]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching event participants:", error);
        return NextResponse.json({ error: "Failed to fetch event participants" }, { status: 500 });
    }
}

// DELETE: remove participant from the event
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");
        const participant_id = searchParams.get("participant_id");

        if (!event_id || !participant_id) {
            return NextResponse.json(
                { error: "Missing event_id or participant_id" },
                { status: 400 }
            );
        }

        await pool.query(
            "DELETE FROM EVENT_PARTICIPANT WHERE event_id = ? AND participant_id = ?",
            [event_id, participant_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing participant from event:", error);
        return NextResponse.json(
            { error: "Failed to remove participant from event" },
            { status: 500 }
        );
    }
}
