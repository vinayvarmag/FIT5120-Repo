// /app/api/expense/route.js
import { NextResponse } from "next/server";
import pool from "../db"; // Adjust if your db file is located elsewhere

/**
 * GET /api/expense?event_id=123
 *
 * Returns the expenses linked to the given event_id.
 * The columns are aliased to match your front-end code:
 *   - category      <-- expense_type
 *   - title         <-- title (varchar)
 *   - amount        <-- expense_amount
 *   - description   <-- expense_description
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");

        if (!event_id) {
            return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
        }

        const [rows] = await pool.query(
            `SELECT
                 e.expense_id                 AS expense_id,
                 e.expense_type               AS category,
                 e.title                      AS title,
                 e.expense_amount             AS amount,
                 e.expense_description        AS description
             FROM EXPENSE e
                      JOIN EVENT_FINANCE ef
                           ON e.expense_id = ef.expense_id
             WHERE ef.event_id = ?`,
            [event_id]
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/expense
 *
 * Expects JSON in the request body:
 *   {
 *     "event_id": 123,
 *     "category": "Venue",
 *     "title": "Main Hall",
 *     "amount": 2000,
 *     "description": "Conference hall booking"
 *   }
 *
 * 1) Inserts a new row into EXPENSE (AUTO_INCREMENT expense_id).
 * 2) Inserts a linking row into EVENT_FINANCE (event_id, expense_id).
 */
export async function POST(request) {
    try {
        const { event_id, category, title, amount, description } =
            await request.json();

        if (!event_id || !category || !amount) {
            return NextResponse.json(
                { error: "Missing required fields: event_id, category, amount" },
                { status: 400 }
            );
        }

        // 1) Insert into EXPENSE
        const [expenseResult] = await pool.query(
            `INSERT INTO EXPENSE
                 (expense_type, title, expense_amount, expense_description)
             VALUES (?, ?, ?, ?)`,
            [
                category,
                title || "",
                amount,                     // decimal(7,2)
                description || ""
            ]
        );
        const expense_id = expenseResult.insertId;

        // 2) Insert link into EVENT_FINANCE
        await pool.query(
            `INSERT INTO EVENT_FINANCE (event_id, expense_id)
             VALUES (?, ?)`,
            [event_id, expense_id]
        );

        return NextResponse.json({ success: true, expense_id });
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json(
            { error: "Failed to create expense" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/expense?expense_id=456
 *
 * Expects JSON in the body, e.g.:
 *   {
 *     "category": "Catering",
 *     "title": "Gala Dinner",
 *     "amount": 1500.00,
 *     "description": "Fancy dinner for VIPs"
 *   }
 *
 * Updates the matching row in EXPENSE. This won't change EVENT_FINANCE
 * since we only update columns in EXPENSE.
 */
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const expense_id = searchParams.get("expense_id");

        if (!expense_id) {
            return NextResponse.json(
                { error: "Missing expense_id" },
                { status: 400 }
            );
        }

        const { category, title, amount, description } =
            await request.json();

        // Update the row in EXPENSE
        await pool.query(
            `UPDATE EXPENSE
         SET expense_type       = ?,
             title              = ?,
             expense_amount     = ?,
             expense_description= ?
       WHERE expense_id = ?`,
            [
                category,
                title || "",
                amount,
                description || "",
                expense_id
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating expense:", error);
        return NextResponse.json(
            { error: "Failed to update expense" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expense?expense_id=789
 *
 * Removes the expense row from EXPENSE. Because we have
 * foreign key with ON DELETE CASCADE, the corresponding row
 * in EVENT_FINANCE is removed automatically.
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const expense_id = searchParams.get("expense_id");

        if (!expense_id) {
            return NextResponse.json(
                { error: "Missing expense_id" },
                { status: 400 }
            );
        }

        await pool.query(
            `DELETE FROM EXPENSE WHERE expense_id = ?`,
            [expense_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json(
            { error: "Failed to delete expense" },
            { status: 500 }
        );
    }
}
