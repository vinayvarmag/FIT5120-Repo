/* ──────────────  USER‑EVENT API  ───────────────
   Methods:
     GET      → list events the caller has saved
     POST     → save/unsave (add row or update favourite flag)
     PATCH    → toggle favourite flag
     DELETE   → completely remove the saved link
───────────────────────────────────────────────── */
import { NextResponse } from "next/server";
import pool            from "../db";          // ︎ adjust if your db module lives elsewhere
import { requireUserId } from "@/lib/auth";   // ︎ same helper you used before

/* ─── GET  /api/user-event  ───────────────────── */
export async function GET() {
    try {
        const user_id = await requireUserId();

        const [rows] = await pool.query(
            `SELECT  e.*,
                     ue.user_favorite,
                     v.venue_name
               FROM  USER_EVENT ue
               JOIN  EVENT       e ON e.event_id  = ue.event_id
               LEFT JOIN VENUE   v ON v.venue_id  = e.venue_id
              WHERE  ue.user_id = ?
           ORDER BY  ue.user_favorite DESC, e.event_startdatetime`,
            [user_id],
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── POST  /api/user-event  ─────────────────────
      Body: { event_id: number, favorite?: boolean }
───────────────────────────────────────────────── */
export async function POST(request) {
    try {
        const { event_id, favorite = false } = await request.json();
        const user_id = await requireUserId();

        await pool.query(
            `INSERT INTO USER_EVENT (event_id, user_id, user_favorite)
                 VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE user_favorite = VALUES(user_favorite)`,
            [event_id, user_id, favorite],
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── PATCH  /api/user-event  ────────────────────
      Body: { event_id: number, favorite: boolean }
───────────────────────────────────────────────── */
export async function PATCH(request) {
    try {
        const { event_id, favorite } = await request.json();
        const user_id = await requireUserId();

        await pool.query(
            `UPDATE USER_EVENT
                SET user_favorite = ?
              WHERE event_id = ? AND user_id = ?`,
            [favorite, event_id, user_id],
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* ─── DELETE  /api/user-event?event_id=123 ─────── */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const event_id = Number(searchParams.get("event_id"));
        const user_id  = await requireUserId();

        await pool.query(
            `DELETE FROM USER_EVENT WHERE event_id = ? AND user_id = ?`,
            [event_id, user_id],
        );

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
