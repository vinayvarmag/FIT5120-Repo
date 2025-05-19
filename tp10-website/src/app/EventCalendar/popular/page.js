// File: src/app/melbourne-events/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link   from "next/link";
import { RiAddLine, RiCheckFill } from "react-icons/ri";

export default function MelbourneEventsPage() {
    /* ─── state ─── */
    const [categories, setCategories] = useState([]);
    const [catId,      setCatId]      = useState("");
    const [events,     setEvents]     = useState([]);
    const [saved,      setSaved]      = useState(new Set());   // event_id set
    const [loading,    setLoading]    = useState(true);

    /* load categories once */
    useEffect(() => {
        fetch("/api/eventfinda/categories")
            .then(r => r.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    /* fetch events whenever category changes */
    useEffect(() => {
        setLoading(true);
        const url = catId
            ? `/api/eventfinda/melbourne?category=${catId}`
            : "/api/eventfinda/melbourne";

        fetch(url)
            .then(r => r.json())
            .then(setEvents)
            .finally(() => setLoading(false));
    }, [catId]);

    /* fetch events already saved */
    useEffect(() => {
        fetch("/api/saved-event")
            .then(r => r.json())
            .then(rows => setSaved(new Set(rows.map(r => r.event_id))))
            .catch(console.error);
    }, []);

    /* save handler */
    const saveEvent = useCallback(async ev => {
        try {
            await fetch("/api/saved-event", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id:       ev.id,
                    event_name:     ev.name,
                    event_url:      ev.url,
                    thumbnail_url:  ev.image_url || null,
                    datetime_start: ev.datetime_start,
                    datetime_end:   ev.datetime_end,
                }),
            });

            /* optimistic UI update */
            setSaved(prev => new Set(prev).add(ev.id));
        } catch (err) {
            console.error(err);
            alert("Couldn’t save the event — please try again.");
        }
    }, []);

    /* ─────────────────────────────────────────────────────────────── */
    return (
        <main className="flex flex-col min-h-screen">
            {/* hero banner */}
            <section className="relative z-0 w-full h-[300px] md:h-[450px] lg:h-[550px]">
                <Image
                    src="/melbourne.jpg"
                    alt="Melbourne skyline at dusk with lights reflecting on the Yarra River"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-4">
                        Popular Events
                    </h1>
                    <p className="text-center max-w-3xl text-white text-lg font-semibold">
                        Discover what’s on around the city right now. Filter by category and jump straight to the experiences that excite you.
                    </p>
                </div>
            </section>

            {/* events grid */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-24">
                {/* category selector */}
                <label className="block mb-8">
                    <span className="mr-2 font-medium">Filter by category:</span>
                    <select
                        className="border rounded px-2 py-1"
                        value={catId}
                        onChange={e => setCatId(e.target.value)}
                    >
                        <option value="">All</option>
                        {(() => {
                            const root = categories.find(c => c.parent_id === null);
                            if (!root) return null;
                            return categories
                                .filter(c => c.parent_id === root.id)
                                .map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ));
                        })()}
                    </select>
                </label>

                {/* states */}
                {loading && <p className="text-center p-8">Loading…</p>}
                {!loading && !events.length && (
                    <p className="text-center p-8 text-zinc-500">No events found.</p>
                )}

                {/* cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map(ev => (
                        <article key={ev.id} className="relative">
                            {/* save button */}
                            <button
                                aria-label={saved.has(ev.id) ? "Saved" : "Save event"}
                                onClick={e => {
                                    e.preventDefault();
                                    if (!saved.has(ev.id)) saveEvent(ev);
                                }}
                                className="absolute top-2 right-2 z-20 p-2 rounded-full
                           bg-white/80 backdrop-blur hover:bg-white shadow"
                            >
                                {saved.has(ev.id) ? (
                                    <RiCheckFill className="text-green-600 text-lg" />
                                ) : (
                                    <RiAddLine className="text-indigo-600 text-lg" />
                                )}
                            </button>

                            {/* card body */}
                            <Link
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden shadow
                           hover:shadow-lg transition bg-white"
                            >
                                {ev.image_url && (
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={ev.image_url}
                                            alt={ev.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-4">
                                    <h3 className="font-semibold mb-1 line-clamp-2">
                                        {ev.name}
                                    </h3>
                                    <p className="text-sm text-zinc-500 line-clamp-3">
                                        {ev.summary ?? (ev.description || "").slice(0, 120)}
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-indigo-600">
                                        View on Eventfinda
                                    </p>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
