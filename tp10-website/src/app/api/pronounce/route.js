export const runtime = "edge";

export async function POST(req) {
    const form = await req.formData();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API_URL}/pronounce`, {
        method: "POST",
        body: form
    });
    const txt = await res.text();
    return new Response(txt, {
        status: res.status,
        headers: { "Content-Type": "application/json" }
    });
}
