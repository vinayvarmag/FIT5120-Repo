export const runtime = "edge";

export async function POST(req) {
    const form = await req.formData();
    const res = await fetch("http://localhost:8000/pronounce", {
        method: "POST",
        body: form
    });
    const txt = await res.text();
    return new Response(txt, {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
