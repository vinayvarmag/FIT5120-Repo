import { NextResponse } from "next/server";
import pool from "../../db";

export async function GET(request, { params }) {
    const { participant_id } = await params;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM PARTICIPANT WHERE participant_id = ?",
            [participant_id]
        );
        if (rows.length === 0) {
            return NextResponse.json({ error: "Participant not found" }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error("Error fetching participant:", error);
        return NextResponse.json({ error: "Failed to fetch participant" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { participant_id } = await params;
    try {
        const {
            participant_fullname,
            participant_description,
            ethnicity_id,
            category_id,
        } = await request.json();

        await pool.query(
            `UPDATE PARTICIPANT 
         SET participant_fullname = ?,
             participant_description = ?,
             ethnicity_id = ?,
             category_id = ?
         WHERE participant_id = ?`,
            [participant_fullname, participant_description, ethnicity_id, category_id, participant_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating participant:", error);
        return NextResponse.json({ error: "Failed to update participant" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { participant_id } = await params;
    try {
        await pool.query("DELETE FROM PARTICIPANT WHERE participant_id = ?", [participant_id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting participant:", error);
        return NextResponse.json({ error: "Failed to delete participant" }, { status: 500 });
    }
}
