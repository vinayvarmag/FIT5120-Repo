// File: src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
    // Build an empty JSON response
    const res = NextResponse.json({ ok: true });

    // Clear the JWT cookie
    res.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,   // expire immediately
    });

    // Clear the user_id cookie
    res.cookies.set("user_id", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,   // expire immediately
    });

    return res;
}
