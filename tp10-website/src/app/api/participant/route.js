// src/app/api/participant/route.js
import { NextResponse } from "next/server";
import pool from "../db";

// GET method: Retrieve all participant
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        let rows = [];
        if (search) {
            const [result] = await pool.query(
                `SELECT * FROM PARTICIPANT
                 WHERE participant_fullname LIKE CONCAT('%', ?, '%')
                    OR participant_description LIKE CONCAT('%', ?, '%')`,
                [search, search]
            );
            rows = result;
        } else {
            const [result] = await pool.query("SELECT * FROM PARTICIPANT");
            rows = result;
        }
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching participant:", error);
        return NextResponse.json({ error: "Failed to fetch participant" }, { status: 500 });
    }
}

// POST method: Create a new participant
export async function POST(request) {
    try {
        const {
            participant_fullname,
            participant_description,
            ethnicity_id,
            category_id,
        } = await request.json();

        await pool.query(
            `INSERT INTO PARTICIPANT
             (participant_fullname, participant_description, ethnicity_id, category_id)
             VALUES (?, ?, ?, ?)`,
            [participant_fullname, participant_description, ethnicity_id, category_id]
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating participant:", error);
        return NextResponse.json({ error: "Failed to create participant" }, { status: 500 });
    }
}
