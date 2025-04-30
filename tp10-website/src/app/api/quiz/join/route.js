export async function POST(req) {
    const data = await req.json();                                // { sessionId, teamName }
    const res = await fetch("http://localhost:8000/quiz/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
