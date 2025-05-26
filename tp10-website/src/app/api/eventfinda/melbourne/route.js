// File: src/app/api/eventfinda/melbourne/route.js
import { NextResponse } from "next/server";

/* Revalidate the static JSON every 10 min */
export const revalidate = 600;

/* ── helper: authenticated fetch ───────────────────────────── */
async function efFetch(path) {
    const user = process.env.EVENTFINDA_USERNAME;
    const pass = process.env.EVENTFINDA_PASSWORD || "";          // blank is OK
    if (!user) throw new Error("EVENTFINDA_USERNAME env var missing");

    const auth = Buffer.from(`${user}:${pass}`).toString("base64");

    const res = await fetch(`https://api.eventfinda.com.au${path}`, {
        headers: {
            Authorization: `Basic ${auth}`,
            Accept:        "application/json",
        },
    });

    if (!res.ok) {
        throw new Error(`Eventfinda ${res.status} ${res.statusText}`);
    }
    return res.json();
}

/* ── cache Melbourne location-id in memory for 10 min ───────── */
let melbourneId = null;
async function getMelbourneId() {
    if (melbourneId) return melbourneId;

    const data = await efFetch(
        "/v2/locations.json?rows=1&q=melbourne&sort=popularity",
    );
    melbourneId = data.locations?.[0]?.id;
    if (!melbourneId) throw new Error("Couldn’t resolve Melbourne location-id");
    return melbourneId;
}

/* ── route handler ─────────────────────────────────────────── */
export async function GET(request) {
    try {
        const locationId = await getMelbourneId();

        const url      = new URL(request.url);
        const q        = url.searchParams;
        const category = q.get("category") ?? undefined;
        const page     = Math.max(1, Number(q.get("page")  ?? 1));
        const rows     = Math.min(100, Math.max(1, Number(q.get("rows") ?? 100)));

        const qs = new URLSearchParams({
            location: String(locationId),
            page:     String(page),
            rows:     String(rows),
            order:    "date",
            /* include basic details + sessions list */
            fields:   "id,url,name,summary,description,images,datetime_start,datetime_end",
            include:  "sessions",
        });
        if (category) qs.set("category", category);

        const { events = [] } = await efFetch(`/v2/events.json?${qs}`);
        return NextResponse.json(events, { status: 200 });

    } catch (err) {
        console.error("Eventfinda Melbourne route error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
