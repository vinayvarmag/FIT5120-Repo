import { NextResponse } from "next/server";
import pool from "../db";

// POST: Create a new logistics task for a specific event.
export async function POST(request) {
    try {
        const {
            event_id,
            logistic_title,
            logistic_description,
            logistic_status = "Pending",
        } = await request.json();

        await pool.query(
            `INSERT INTO EVENT_LOGISTICS 
       (event_id, logistic_title, logistic_description, logistic_status)
       VALUES (?, ?, ?, ?)`,
            [event_id, logistic_title, logistic_description, logistic_status]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating logistics task:", error);
        return NextResponse.json(
            { error: "Failed to create logistics task" },
            { status: 500 }
        );
    }
}

// GET: Retrieve all logistics tasks for a given event.
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");

        if (!event_id) {
            return NextResponse.json(
                { error: "Missing event_id" },
                { status: 400 }
            );
        }

        const [rows] = await pool.query(
            `SELECT * FROM EVENT_LOGISTICS
       WHERE event_id = ?
       ORDER BY created_at DESC`,
            [event_id]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching logistics tasks:", error);
        return NextResponse.json(
            { error: "Failed to fetch logistics tasks" },
            { status: 500 }
        );
    }
}

// PUT: Update an existing logistics task.
export async function PUT(request) {
    try {
        const {
            logistic_id,
            event_id,
            logistic_title,
            logistic_description,
            logistic_status,
        } = await request.json();

        if (!logistic_id) {
            return NextResponse.json(
                { error: "Missing logistic_id" },
                { status: 400 }
            );
        }

        await pool.query(
            `UPDATE EVENT_LOGISTICS
       SET event_id = ?,
           logistic_title = ?,
           logistic_description = ?,
           logistic_status = ?
       WHERE logistic_id = ?`,
            [event_id, logistic_title, logistic_description, logistic_status, logistic_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating logistics task:", error);
        return NextResponse.json(
            { error: "Failed to update logistics task" },
            { status: 500 }
        );
    }
}

// DELETE: Remove a logistics task.
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const logistic_id = searchParams.get("logistic_id");
        if (!logistic_id) {
            return NextResponse.json(
                { error: "Missing logistic_id" },
                { status: 400 }
            );
        }
        await pool.query("DELETE FROM EVENT_LOGISTICS WHERE logistic_id = ?", [logistic_id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting logistics task:", error);
        return NextResponse.json(
            { error: "Failed to delete logistics task" },
            { status: 500 }
        );
    }
}
