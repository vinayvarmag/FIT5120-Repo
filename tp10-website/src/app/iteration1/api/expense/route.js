// /app/api/expense/route.js
import { NextResponse } from "next/server";
import pool from "../db";  // adjust path if needed

/**
 * GET /api/expense?event_id=123
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
                    e.expense_id          AS expense_id,
                    c.category            AS category,
                    e.title               AS title,
                    e.expense_amount      AS amount,
                    e.expense_description AS description
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
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

/**
 * POST /api/expense
 */
export async function POST(request) {
    try {
        const { event_id, categoryId, title, amount, description } = await request.json();
        if (!event_id || !categoryId || amount == null) {
            return NextResponse.json(
                { error: "Missing required fields: event_id, categoryId, amount" },
                { status: 400 }
            );
        }

        // 1) Insert into EXPENSE
        const [expenseResult] = await pool.query(
            `
                INSERT INTO EXPENSE (expense_category_id, title, expense_amount, expense_description)
                VALUES (?, ?, ?, ?)
            `,
            [categoryId, title || "", amount, description || ""]
        );
        const expense_id = expenseResult.insertId;

        // 2) Link to EVENT_FINANCE
        await pool.query(
            `
                INSERT INTO EVENT_FINANCE (event_id, expense_id)
                VALUES (?, ?)
            `,
            [event_id, expense_id]
        );

        // ▽ Recalculate and update EVENT.current_expenses
        const [[{ total }]] = await pool.query(
            `
        SELECT SUM(e.expense_amount) AS total
        FROM EXPENSE e
        JOIN EVENT_FINANCE ef ON e.expense_id = ef.expense_id
        WHERE ef.event_id = ?
      `,
            [event_id]
        );
        await pool.query(
            `UPDATE EVENT SET current_expenses = ? WHERE event_id = ?`,
            [total || 0, event_id]
        );

        return NextResponse.json({ success: true, expense_id });
    } catch (error) {
        console.error("Error creating expense:", error);
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}

/**
 * PUT /api/expense?expense_id=456
 */
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const expense_id = searchParams.get("expense_id");
        if (!expense_id) {
            return NextResponse.json({ error: "Missing expense_id" }, { status: 400 });
        }

        const { categoryId, title, amount, description } = await request.json();
        await pool.query(
            `
        UPDATE EXPENSE
        SET expense_category_id  = ?,
            title                = ?,
            expense_amount       = ?,
            expense_description  = ?
        WHERE expense_id = ?
      `,
            [categoryId, title || "", amount, description || "", expense_id]
        );

        // ▽ Find the linked event_id
        const [[{ event_id }]] = await pool.query(
            `SELECT event_id FROM EVENT_FINANCE WHERE expense_id = ?`,
            [expense_id]
        );

        // ▽ Recalculate and update EVENT.current_expenses
        const [[{ total }]] = await pool.query(
            `
        SELECT SUM(e.expense_amount) AS total
        FROM EXPENSE e
        JOIN EVENT_FINANCE ef ON e.expense_id = ef.expense_id
        WHERE ef.event_id = ?
      `,
            [event_id]
        );
        await pool.query(
            `UPDATE EVENT SET current_expenses = ? WHERE event_id = ?`,
            [total || 0, event_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating expense:", error);
        return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
    }
}

/**
 * DELETE /api/expense?expense_id=789
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const expense_id = searchParams.get("expense_id");
        if (!expense_id) {
            return NextResponse.json({ error: "Missing expense_id" }, { status: 400 });
        }

        // ▽ Grab event_id before deleting link
        const [[{ event_id }]] = await pool.query(
            `SELECT event_id FROM EVENT_FINANCE WHERE expense_id = ?`,
            [expense_id]
        );

        // 1) Remove the expense
        await pool.query(
            `DELETE FROM EXPENSE WHERE expense_id = ?`,
            [expense_id]
        );

        // ▽ Recalculate and update EVENT.current_expenses
        const [[{ total }]] = await pool.query(
            `
        SELECT SUM(e.expense_amount) AS total
        FROM EXPENSE e
        JOIN EVENT_FINANCE ef ON e.expense_id = ef.expense_id
        WHERE ef.event_id = ?
      `,
            [event_id]
        );
        await pool.query(
            `UPDATE EVENT SET current_expenses = ? WHERE event_id = ?`,
            [total || 0, event_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting expense:", error);
        return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
    }
}
