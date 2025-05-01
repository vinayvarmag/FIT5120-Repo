export const runtime = "edge";

export async function POST(req) {
    try {
        // 1) pull off the form
        const form = await req.formData();

        // 2) make sure your API_URL is actually set
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (!API_URL) {
            console.error("🚨 NEXT_PUBLIC_API_URL is not defined!");
            return new Response(
                JSON.stringify({ error: "Server configuration error" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
        console.log("🛰️  proxying to:", API_URL + "/pronounce");

        // 3) forward the request
        const res = await fetch(`${API_URL}/pronounce`, {
            method: "POST",
            body: form,
        });

        // 4) bubble back both success and failure
        const text = await res.text();
        return new Response(text, {
            status: res.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        // 5) catch _everything_ so we don’t auto-502 with no clue
        console.error("Edge function error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
