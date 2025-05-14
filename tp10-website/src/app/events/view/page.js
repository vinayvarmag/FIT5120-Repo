/* File: src/app/events/page.js */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";   //  adjust the import path

export default function EventsHome() {
    const { user } = useAuth();          // { user_id, name, … }  or null
    const [events,  setEvents]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");

    /* ── load events *after* we know whether someone is logged in ── */
    useEffect(() => {
        // user === null  ⇒ not logged in
        // user === object ⇒ logged in
        // (AuthProvider sets `null` after it finishes the /api/auth/me call)
        if (user === undefined) return;      // still mounting (rare)
        if (!user) {                         // no session → nothing to load
            setLoading(false);
            setEvents([]);
            return;
        }

        async function load() {
            setLoading(true);
            const res  = await fetch("/api/event");   // server filters by cookie
            const json = await res.json();
            setEvents(Array.isArray(json) ? json : []);  // hard‑guard
            setLoading(false);
        }
        load();
    }, [user]);   // re‑run if the user logs in/out without a full page reload

    /* ── helpers ── */
    function formatRange(ev) {
        if (!ev.event_startdatetime) return "Date TBA";
        const start    = new Date(ev.event_startdatetime);
        const end      = ev.event_enddatetime ? new Date(ev.event_enddatetime) : null;
        const opts     = { day: "2-digit", month: "short", year: "numeric" };
        const startStr = start.toLocaleDateString(undefined, opts);
        if (!end) return startStr;
        return start.toDateString() === end.toDateString()
            ? startStr
            : `${startStr} – ${end.toLocaleDateString(undefined, opts)}`;
    }

    async function copyRsvpLink(ev) {
        const link = `${location.origin}/events/${ev.event_id}/rsvp`;
        await navigator.clipboard.writeText(link);
        alert("Public RSVP link copied to clipboard!");
    }

    async function deleteEvent(ev) {
        if (!confirm(`Are you sure you want to delete “${ev.event_title}”?`)) return;
        const res = await fetch(`/api/event/${ev.event_id}`, { method: "DELETE" });
        if (res.ok) setEvents(prev => prev.filter(e => e.event_id !== ev.event_id));
        else        alert("Failed to delete event.");
    }

    const filtered = (Array.isArray(events) ? events : []).filter(ev =>
        ev.event_title.toLowerCase().includes(search.toLowerCase())
    );

    /* ── UI ── */
    return (
        <main className="min-h-screen bg-gray-50 text-black pt-24 pb-10">
            <div className="max-w-7xl mx-auto px-4">

                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Events</h1>

                    <div className="flex-1 flex gap-4 md:justify-end">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search title…"
                            className="flex-1 md:flex-none md:w-64 border rounded-lg px-3 py-2"
                        />
                        {user && (         /* only show “Create” if logged in */
                            <Link
                                href="/events/create"
                                className="bg-purple-900 text-white px-4 py-2 rounded-lg hover:bg-purple-800 flex-none"
                            >
                                + Create Event
                            </Link>
                        )}
                    </div>
                </header>

                {loading ? (
                    <p>Loading…</p>
                ) : !user ? (
                    <p>Please <Link href="/login" className="underline">log in</Link> to see your events.</p>
                ) : filtered.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(ev => (
                            <div key={ev.event_id}
                                 className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">

                                {/* title + date */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-1 truncate">{ev.event_title}</h2>
                                    <p className="text-sm text-gray-600">{formatRange(ev)}</p>
                                    {ev.venue_name && (
                                        <p className="text-sm text-gray-600 mt-1">{ev.venue_name}</p>
                                    )}
                                </div>

                                {/* actions */}
                                <div className="mt-6 flex flex-col gap-2">
                                    <Link
                                        href={`/events/${ev.event_id}/edit`}
                                        className="w-full text-center bg-purple-200 text-white py-2 rounded-lg hover:bg-purple-800"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => deleteEvent(ev)}
                                        className="w-full text-center bg-rose-200 text-white py-2 rounded-lg hover:bg-rose-700"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => copyRsvpLink(ev)}
                                        className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        Copy RSVP Link
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
