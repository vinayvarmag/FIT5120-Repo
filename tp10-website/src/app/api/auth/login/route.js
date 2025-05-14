// File: app/api/auth/login/route.js
import { NextResponse } from "next/server";
import bcrypt          from "bcryptjs";
import jwt             from "jsonwebtoken";
import pool            from "../../db";          // absolute import → works everywhere

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("JWT_SECRET env var is missing");

export async function POST(request) {
    try {
        /* ───── 1. basic payload check ───── */
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        /* ───── 2. look up user ───── */
        const [rows] = await pool.query(
            `SELECT user_id, password_hash
               FROM USER
              WHERE email = ?
              LIMIT 1`,
            [email]
        );
        if (rows.length === 0) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const { user_id, password_hash } = rows[0];
        const ok = await bcrypt.compare(password, password_hash);
        if (!ok) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        /* ───── 3. issue JWT ───── */
        const token = jwt.sign({ sub: user_id }, JWT_SECRET, { expiresIn: "7d" });

        /* ───── 4. build response & cookies ───── */
        const res = NextResponse.json({ ok: true });

        // JWT for API auth (HttpOnly)
        res.cookies.set("token", token, {
            httpOnly : true,
            secure   : process.env.NODE_ENV === "production",
            sameSite : "lax",
            path     : "/",
            maxAge   : 60 * 60 * 24 * 7,   // 7 days
        });

        // plain numeric id for `getUserId()` helpers (HttpOnly as well)
        res.cookies.set("user_id", String(user_id), {
            httpOnly : true,
            secure   : process.env.NODE_ENV === "production",
            sameSite : "lax",
            path     : "/",
            maxAge   : 60 * 60 * 24 * 7,
        });

        return res;
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
