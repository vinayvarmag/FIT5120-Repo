export async function GET(req) {
    // simply forward the query string (?sessionId=...)
    const qs = req.url.split("?")[1] || "";
    const url = `http://localhost:8000/quiz/scoreboard${qs ? "?" + qs : ""}`;
    const res = await fetch(url, { method: "GET" });
    return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
