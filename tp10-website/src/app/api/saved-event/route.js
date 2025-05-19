// File: src/app/api/saved-event/route.js
import { NextResponse } from "next/server";
import pool from "../db";
import { requireUserId } from "@/lib/auth";

/* GET ------------------------------------------------------------------ */
export async function GET() {
    try {
        const user_id = await requireUserId();
        if (!user_id) return NextResponse.json([]);

        const [rows] = await pool.query(
            `SELECT id, event_id, event_name, event_url, thumbnail_url,
                    datetime_start, datetime_end, created_at
             FROM saved_events
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [user_id],
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch saved events" }, { status: 500 });
    }
}

/* POST ----------------------------------------------------------------- */
export async function POST(request) {
    try {
        const user_id = await requireUserId();
        const {
            event_id,
            event_name,
            event_url,
            thumbnail_url = null,
            datetime_start = null,
            datetime_end   = null,
        } = await request.json();

        if (!event_id || !event_name || !event_url) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await pool.query(
            `INSERT IGNORE INTO saved_events
             (user_id, event_id, event_name, event_url,
              thumbnail_url, datetime_start, datetime_end)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                event_id,
                event_name,
                event_url,
                thumbnail_url,
                datetime_start ? new Date(datetime_start) : null,
                datetime_end   ? new Date(datetime_end)   : null,
            ],
        );

        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (err) {
        if (err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "Login required" }, { status: 401 });
        }
        console.error(err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

/* DELETE – unchanged ---------------------------------------------------- */
export async function DELETE(request) {
    try {
        const user_id  = await requireUserId();
        const event_id = request.nextUrl.searchParams.get("event_id");
        if (!event_id) {
            return NextResponse.json({ error: "event_id query param required" }, { status: 400 });
        }
        const [result] = await pool.query(
            `DELETE FROM saved_events WHERE user_id = ? AND event_id = ?`,
            [user_id, event_id],
        );
        return NextResponse.json({ deleted: result.affectedRows || 0 });
    } catch (err) {
        if (err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ error: "Login required" }, { status: 401 });
        }
        console.error(err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
