// File: src/app/api/eventfinda/melbourne/route.js
import { NextResponse } from "next/server";

/* Revalidate the static JSON every 10 min */
export const revalidate = 600;

/* ── helper: authenticated fetch ───────────────────────────────────────── */
async function efFetch(path) {
    const user = process.env.EVENTFINDA_USERNAME;
    const pass = process.env.EVENTFINDA_PASSWORD || "";         // blank is fine
    if (!user) throw new Error("EVENTFINDA_USERNAME env var missing");

    const auth = Buffer.from(`${user}:${pass}`).toString("base64");

    const res = await fetch(`https://api.eventfinda.com.au${path}`, {
        headers: {
            Authorization: `Basic ${auth}`,
            Accept:        "application/json"
        }
    });

    if (!res.ok) {
        throw new Error(`Eventfinda ${res.status} ${res.statusText}`);
    }
    return res.json();
}

/* ── cache Melbourne’s numeric location-id in memory for 10 min ────────── */
let melbourneId = null;

async function getMelbourneId() {
    if (melbourneId) return melbourneId;

    const data = await efFetch(
        "/v2/locations.json?rows=1&q=melbourne&sort=popularity"
    );
    melbourneId = data.locations?.[0]?.id;
    if (!melbourneId) throw new Error("Couldn’t resolve Melbourne location-id");
    return melbourneId;
}

/* ── route handler ─────────────────────────────────────────────────────── */
export async function GET(request) {
    try {
        const location = await getMelbourneId();

        /* optional ?category=6,17 from the client */
        const cat = new URL(request.url).searchParams.get("category");

        const qs = new URLSearchParams({
            location: String(location),  // numeric ID
            rows:     "12",
            order:    "date",
            /* ↓ now includes start / end datetime fields */
            fields:   "id,url,name,summary,description,images,datetime_start,datetime_end"
            //  (or fields=dates if you want the full dates object)
        });

        if (cat) qs.set("category", cat);

        const { events = [] } = await efFetch(`/v2/events.json?${qs}`);
        return NextResponse.json(events);

    } catch (err) {
        console.error("Eventfinda Melbourne route-error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
