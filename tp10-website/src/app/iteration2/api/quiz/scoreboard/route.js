export async function GET(req) {
    // simply forward the query string (?sessionId=...)
    const qs = req.url.split("?")[1] || "";
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const url = `${API_URL}/quiz/scoreboard${qs ? "?" + qs : ""}`;
    const res = await fetch(url, { method: "GET" });
    return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
