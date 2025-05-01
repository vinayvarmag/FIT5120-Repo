export async function POST(req) {
    const data = await req.json();                                // { sessionId, teamName }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_URL}/quiz/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
