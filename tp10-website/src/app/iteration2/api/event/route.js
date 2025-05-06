import { NextResponse } from "next/server";
import pool from "../db"; // ← Adjust the import path to match your actual db.js location

// GET: Retrieve all events (with joined venue info)
export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT
        e.*,
        v.venue_name,
        v.venue_category,
        v.venue_long,
        v.venue_lat
      FROM EVENT e
      LEFT JOIN VENUE v ON e.venue_id = v.venue_id
    `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

// POST: Create a new event
export async function POST(request) {
    try {
        const {
            event_title,
            event_description,
            event_startdatetime,
            event_enddatetime,
            venue_id,
            event_budget,
        } = await request.json();

        // Insert into EVENT, using location_id = venue_id
        await pool.query(
            `INSERT INTO EVENT
             (event_title, event_description, event_startdatetime, event_enddatetime, venue_id, event_budget)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [event_title, event_description, event_startdatetime, event_enddatetime, venue_id, event_budget]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
