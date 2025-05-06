import { NextResponse } from "next/server";
import pool from "../db";

// POST: Create a new agenda item for a specific event.
export async function POST(request) {
    try {
        const { event_id, agenda_timeframe, agenda_title, agenda_description, agenda_status = "Pending" } = await request.json();
        await pool.query(
            `INSERT INTO EVENT_AGENDA 
       (event_id, agenda_timeframe, agenda_title, agenda_description, agenda_status)
       VALUES (?, ?, ?, ?, ?)`,
            [event_id, agenda_timeframe, agenda_title, agenda_description, agenda_status]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating agenda item:", error);
        return NextResponse.json({ error: "Failed to create agenda item" }, { status: 500 });
    }
}

// GET: Retrieve all agenda items for a given event.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");

        if (!event_id) {
            return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
        }

        const [rows] = await pool.query(
            `SELECT * FROM EVENT_AGENDA 
       WHERE event_id = ? 
       ORDER BY created_at DESC`,
            [event_id]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching agenda items:", error);
        return NextResponse.json({ error: "Failed to fetch agenda items" }, { status: 500 });
    }
}

// PUT: Update an existing agenda item.
export async function PUT(request) {
    try {
        const { agenda_id, event_id, agenda_timeframe, agenda_title, agenda_description, agenda_status } = await request.json();
        if (!agenda_id) {
            return NextResponse.json({ error: "Missing agenda_id" }, { status: 400 });
        }
        await pool.query(
            `UPDATE EVENT_AGENDA
       SET event_id = ?, agenda_timeframe = ?, agenda_title = ?, agenda_description = ?, agenda_status = ?
       WHERE agenda_id = ?`,
            [event_id, agenda_timeframe, agenda_title, agenda_description, agenda_status, agenda_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating agenda item:", error);
        return NextResponse.json({ error: "Failed to update agenda item" }, { status: 500 });
    }
}

// DELETE: Remove an agenda item.
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const agenda_id = searchParams.get("agenda_id");
        if (!agenda_id) {
            return NextResponse.json({ error: "Missing agenda_id" }, { status: 400 });
        }
        await pool.query(
            "DELETE FROM EVENT_AGENDA WHERE agenda_id = ?",
            [agenda_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting agenda item:", error);
        return NextResponse.json({ error: "Failed to delete agenda item" }, { status: 500 });
    }
}
