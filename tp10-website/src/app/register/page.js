"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            // On success, send user to the login page
            router.push("/login");
        } else {
            // Show server-provided error or a fallback message
            const { error: msg } = await res.json().catch(() => ({}));
            setError(msg || "Registration failed. Please try again.");
        }
    }

    return (
        <main className="pt-24 mx-auto max-w-md px-4 text-black">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded-lg px-4 py-2"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border rounded-lg px-4 py-2"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                />
                {error && <p className="text-red-600">{error}</p>}
                <button className="w-full bg-purple-900 hover:bg-purple-700 text-white py-2 rounded-lg">
                    Create Account
                </button>
            </form>
        </main>
    );
}
