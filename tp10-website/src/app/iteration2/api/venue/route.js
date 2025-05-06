import { NextResponse } from "next/server";
import pool from "../db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        let rows = [];
        if (search) {
            const [result] = await pool.query(
                "SELECT * FROM VENUE WHERE venue_name LIKE CONCAT('%', ?, '%')",
                [search]
            );
            rows = result;
        } else {
            const [result] = await pool.query("SELECT * FROM VENUE");
            rows = result;
        }
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching venues:", error);
        return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
    }
}