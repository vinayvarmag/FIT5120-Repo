// /app/api/expense/route.js
import { NextResponse } from "next/server";
import pool from "../db"; // Update path to your db config if necessary

/**
 * GET /api/expense?event_id=123
 *
 * Returns the expenses linked to the given event_id.
 * We JOIN with event_budget_categories to get the category name.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = searchParams.get("event_id");

        if (!event_id) {
            return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
        }

        const [rows] = await pool.query(
            `
                SELECT
                    e.expense_id             AS expense_id,
                    c.category               AS category,         -- from event_budget_categories
                    e.title                  AS title,
                    e.expense_amount         AS amount,
                    e.expense_description    AS description
                FROM EXPENSE e
                         JOIN event_budget_categories c
                              ON e.expense_category_id = c.id
                         JOIN EVENT_FINANCE ef
                              ON e.expense_id = ef.expense_id
                WHERE ef.event_id = ?
            `,
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
 * {
 *   "event_id": 123,
 *   "categoryId": 2,       // references event_budget_categories(id)
 *   "title": "Main Hall",
 *   "amount": 2000,
 *   "description": "Conference hall booking"
 * }
 *
 * 1) Insert a new row into EXPENSE (AUTO_INCREMENT expense_id).
 * 2) Insert a linking row into EVENT_FINANCE (event_id, expense_id).
 */
export async function POST(request) {
    try {
        const { event_id, categoryId, title, amount, description } =
            await request.json();

        if (!event_id || !categoryId || amount == null) {
            return NextResponse.json(
                { error: "Missing required fields: event_id, categoryId, amount" },
                { status: 400 }
            );
        }

        // 1) Insert into EXPENSE using the new expense_category_id column
        const [expenseResult] = await pool.query(
            `
                INSERT INTO EXPENSE (expense_category_id, title, expense_amount, expense_description)
                VALUES (?, ?, ?, ?)
            `,
            [categoryId, title || "", amount, description || ""]
        );
        const expense_id = expenseResult.insertId;

        // 2) Insert link into EVENT_FINANCE
        await pool.query(
            `
                INSERT INTO EVENT_FINANCE (event_id, expense_id)
                VALUES (?, ?)
            `,
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
 * {
 *   "categoryId": 3,
 *   "title": "Gala Dinner",
 *   "amount": 1500.00,
 *   "description": "Fancy dinner for VIPs"
 * }
 *
 * Updates the matching row in EXPENSE.
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

        const { categoryId, title, amount, description } = await request.json();

        // Update the row in EXPENSE
        await pool.query(
            `
                UPDATE EXPENSE
                SET expense_category_id = ?,
                    title              = ?,
                    expense_amount     = ?,
                    expense_description= ?
                WHERE expense_id = ?
            `,
            [categoryId, title || "", amount, description || "", expense_id]
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
 * a foreign key in EVENT_FINANCE with ON DELETE CASCADE,
 * that link is removed automatically (if configured as such),
 * or you can manually delete from EVENT_FINANCE as well.
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
            `
                DELETE FROM EXPENSE
                WHERE expense_id = ?
            `,
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
