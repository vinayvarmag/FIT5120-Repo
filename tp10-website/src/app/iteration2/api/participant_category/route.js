import { NextResponse } from "next/server";
import pool from "../db";

export async function GET(request) {
    try {
        const [rows] = await pool.query("SELECT * FROM PARTICIPANT_CATEGORY");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching participant categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch participant categories" },
            { status: 500 }
        );
    }
}
