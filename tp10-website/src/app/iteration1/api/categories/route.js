// /app/api/categories/route.js

import { NextResponse } from "next/server";
import pool from "../db"; // Adjust import path if your db config is located elsewhere

/**
 * GET /api/categories
 *
 * Fetches all category rows from the event_budget_categories table.
 * Returns an array like:
 * [
 *   { id: 1, category: "Venue and Infrastructure" },
 *   { id: 2, category: "Catering and Food & Beverage" },
 *   ...
 * ]
 */
export async function GET(request) {
    try {
        const [rows] = await pool.query(`
      SELECT id, category
      FROM event_budget_categories
      ORDER BY id
    `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
