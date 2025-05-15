/* File: src/app/api/venue/route.js
 *
 * Returns Google Places Autocomplete suggestions for venue names.
 * Query param:  ?search=royal%20exhibition
 * Env var:      GOOGLE_PLACES_API_KEY  – your server-side key
 */

import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const input = searchParams.get("search") || "";

        /* ─── bail early if no query ─── */
        if (!input.trim()) {
            return NextResponse.json([]);
        }

        /* ─── call Google Places ─── */
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GOOGLE_PLACES_API_KEY env variable");
        }

        const url = new URL(
            "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        );
        url.searchParams.set("input", input);
        url.searchParams.set("types", "establishment");      // venues only
        url.searchParams.set("components", "country:au");    // limit to AU; drop if not wanted
        url.searchParams.set("key", apiKey);

        const res   = await fetch(url, { cache: "no-store" });
        const json  = await res.json();

        if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
            console.error("Places API error:", json);
            throw new Error(json.error_message || json.status);
        }

        /* return just the autocomplete predictions */
        return NextResponse.json(json.predictions);
    } catch (err) {
        console.error("Error fetching Places suggestions:", err);
        return NextResponse.json(
            { error: "Failed to fetch venue suggestions" },
            { status: 500 },
        );
    }
}
