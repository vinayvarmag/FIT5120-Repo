export async function POST(req) {
    const data = await req.json();                                // { cats: [...], n: 4 }
    const res = await fetch("http://localhost:8000/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return new Response(await res.text(), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
