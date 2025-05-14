// File: app/api/auth/me/route.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request) {
    // Grab the `token` cookie
    const cookie = request.cookies.get('token')
    if (!cookie) {
        // not logged in → return null
        return NextResponse.json(null)
    }

    try {
        // Verify & decode. Make sure JWT_SECRET is in your env.
        const payload = jwt.verify(cookie.value, process.env.JWT_SECRET)

        // Return only the bits your client needs
        return NextResponse.json({
            id:    payload.id,
            email: payload.email,
            name:  payload.name
        })
    } catch (err) {
        // expired/invalid token → treat as not authenticated
        return NextResponse.json(null)
    }
}
