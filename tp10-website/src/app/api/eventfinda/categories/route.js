import { NextResponse } from "next/server";

/* reuse the same helper as above (copy-pasted here) */
async function efFetch(path) {
    const user = process.env.EVENTFINDA_USERNAME;
    const pass = process.env.EVENTFINDA_PASSWORD || "";
    const auth = Buffer.from(`${user}:${pass}`).toString("base64");

    const res = await fetch(`https://api.eventfinda.com.au${path}`, {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`Eventfinda ${res.status}`);
    return res.json();
}

/* cache for 24 h – category IDs rarely change */
export const revalidate = 86_400;

export async function GET() {
    const data = await efFetch("/v2/categories.json?rows=200");
    return NextResponse.json(data.categories || []);
}
