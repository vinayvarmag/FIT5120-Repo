import { NextResponse } from "next/server";
import pool from "../db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        // Adjust your query as needed for your database.
        const [rows] = await pool.query(
            `SELECT p.participant_id,
              p.participant_fullname,
              p.participant_description,
              e.ethnicity_name,
              c.category_name,
              p.ethnicity_id,
              p.category_id
         FROM PARTICIPANT p
         LEFT JOIN ETHNICITY e ON p.ethnicity_id = e.ethnicity_id
         LEFT JOIN PARTICIPANT_CATEGORY c ON p.category_id = c.category_id
        WHERE p.participant_fullname LIKE ? OR p.participant_description LIKE ?`,
            [`%${search}%`, `%${search}%`]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching participants:", error);
        return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
    }
}