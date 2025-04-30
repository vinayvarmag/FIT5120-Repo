import { NextResponse } from "next/server";
import pool from "../db";

export async function GET(request) {
    try {
        const [rows] = await pool.query("SELECT * FROM ETHNICITY");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching ethnicities:", error);
        return NextResponse.json({ error: "Failed to fetch ethnicities" }, { status: 500 });
    }
}
