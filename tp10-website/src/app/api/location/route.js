import { NextResponse } from "next/server";
import pool from "../db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        let rows = [];
        if (search) {
            const [result] = await pool.query(
                "SELECT * FROM LOCATION WHERE location_address LIKE CONCAT('%', ?, '%')",
                [search]
            );
            rows = result;
            console.log(result);
        } else {
            const [result] = await pool.query("SELECT * FROM LOCATION");
            rows = result;
        }
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
}