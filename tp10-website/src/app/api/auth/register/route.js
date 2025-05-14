import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../../db";        // adjust path if your db.js is elsewhere

const { JWT_SECRET } = process.env;

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // check for existing account
        const [existing] = await pool.query(
            "SELECT user_id FROM `USER` WHERE email = ? LIMIT 1",
            [email]
        );
        if (existing.length) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        // hash & insert
        const hash = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            "INSERT INTO `USER` (email, password_hash) VALUES (?, ?)",
            [email, hash]
        );
        const userId = result.insertId;

        // auto-login: mint JWT & set cookie
        const token = jwt.sign({ sub: userId }, JWT_SECRET, {
            expiresIn: "7d",
        });
        const res = NextResponse.json({ ok: true }, { status: 201 });
        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return res;

    } catch (err) {
        console.error("Registration error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
