// lib/auth.js
import { cookies } from "next/headers";

/* ─── soft check ─────────────────────────────────────────── */
export async function getUserId() {
    const userId = (await cookies()).get("user_id")?.value;
    console.log(userId);
    return userId ? Number(userId) : null;
}

/* ─── hard check ─────────────────────────────────────────── */
export async function requireUserId() {
    const uid = await getUserId();
    if (uid === null || Number.isNaN(uid)) {
        throw new Error("UNAUTHENTICATED");
    }
    return uid;
}
