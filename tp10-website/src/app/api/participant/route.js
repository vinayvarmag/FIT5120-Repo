// src/app/api/participant/route.js
import { NextResponse } from "next/server";
import pool from "../db";

// GET method: Retrieve all participant
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        let rows = [];
        // Use the same query whether or not a search term is provided.
        const query = `
      SELECT p.participant_id,
             p.participant_fullname,
             p.participant_description,
             e.ethnicity_name,
             c.category_name,
             p.ethnicity_id,
             p.category_id
      FROM PARTICIPANT p
      LEFT JOIN ETHNICITY e ON p.ethnicity_id = e.ethnicity_id
      LEFT JOIN PARTICIPANT_CATEGORY c ON p.category_id = c.category_id
      ${search ? "WHERE p.participant_fullname LIKE ? OR p.participant_description LIKE ?" : ""}
    `;
        if (search) {
            const [result] = await pool.query(query, [`%${search}%`, `%${search}%`]);
            rows = result;
        } else {
            const [result] = await pool.query(query);
            rows = result;
        }
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching participants:", error);
        return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
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
