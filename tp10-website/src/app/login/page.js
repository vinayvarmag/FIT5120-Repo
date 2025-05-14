"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router      = useRouter();
    const { setUser } = useAuth();

    const [form,   setForm]   = useState({ email: "", password: "" });
    const [error,  setError]  = useState("");
    const [busy,   setBusy]   = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (busy) return;           // guard‑rail
        setBusy(true);
        setError("");

        /* 1. POST /api/auth/login  – sets the cookie */
        const res = await fetch("/api/auth/login", {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body   : JSON.stringify(form),
            credentials: "include",     // important
        });

        if (!res.ok) {
            const { error: msg } = await res.json().catch(() => ({}));
            setError(msg || "Invalid credentials");
            setBusy(false);
            return;
        }

        /* 2. GET /api/auth/me – server reads cookie, returns user */
        const me = await fetch("/api/auth/me", { credentials: "include" })
            .then(r => r.json());

        setUser(me);           // update React context
        router.refresh();      // revalidate server components
        router.push("/events");
    }

    return (
        <main className="pt-24 mx-auto max-w-md px-4 text-black">
            <h1 className="text-2xl font-bold mb-6 text-center">Log In</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg px-4 py-2"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border rounded-lg px-4 py-2"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                />

                {error && <p className="text-red-600">{error}</p>}

                <button
                    disabled={busy}
                    className={`w-full py-2 rounded-lg text-white
                               ${busy
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-900 hover:bg-purple-700"}`}
                >
                    {busy ? "Signing in…" : "Sign In"}
                </button>
            </form>
        </main>
    );
}
