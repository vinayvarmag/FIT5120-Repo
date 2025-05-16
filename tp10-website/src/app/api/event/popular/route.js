// Fetch “most popular” live events in your own organisation
import { NextResponse } from "next/server";

export const revalidate = 600;              // 10 min ISR cache

export async function GET() {
    try {
        const token  = process.env.EVENTBRITE_ACCESS_TOKEN;
        const orgId  = process.env.EVENTBRITE_ORGANIZATION_ID;
        if (!token || !orgId) throw new Error(
            "Missing EVENTBRITE_ACCESS_TOKEN or EVENTBRITE_ORGANIZATION_ID env vars"
        );

        const qs = new URLSearchParams({
            status:   "live",
            expand:   "logo",
            "page_size": "50",
            // You can add “time_filter=today”, “sort_by=start_desc”, etc.
        });

        const res = await fetch(
            `https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?${qs}`,
            { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error(`Eventbrite ${res.status}`);

        const { events = [] } = await res.json();

        /* crude “popularity” sort – highest capacity first; tweak as you wish */
        const popular = events
            .filter(e => !e.listed === false)        // keep public events only
            .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
            .slice(0, 12);                           // top 12 cards

        return NextResponse.json({ events: popular });
    } catch (err) {
        console.error("Eventbrite API error", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
