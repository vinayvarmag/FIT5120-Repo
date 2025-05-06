import { NextResponse } from "next/server";
import pool from "../../db";

export async function PUT(request, { params }) {
    const { id } = await params; // This is the logistic_id from the URL /api/logistics/1
    try {
        const { event_id, logistic_title, logistic_description, logistic_status } = await request.json();
        await pool.query(
            `UPDATE EVENT_LOGISTICS
       SET event_id = ?,
           logistic_title = ?,
           logistic_description = ?,
           logistic_status = ?
       WHERE logistic_id = ?`,
            [event_id, logistic_title, logistic_description, logistic_status, id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating logistic task:", error);
        return NextResponse.json({ error: "Failed to update logistic task" }, { status: 500 });
    }
}