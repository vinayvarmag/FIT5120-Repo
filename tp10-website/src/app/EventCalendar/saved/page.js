/* File: src/app/saved/page.js */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiStarLine, RiStarFill } from "react-icons/ri";

export default function SavedEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ─── initial fetch ─── */
    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await fetch("/api/user-event").then(r => r.json());

            // sort: favourites first ↘ then by start‑datetime asc
            data.sort(
                (a, b) =>
                    Number(b.user_favorite) - Number(a.user_favorite) ||
                    new Date(a.event_startdatetime) - new Date(b.event_startdatetime),
            );
            setEvents(data);
            setLoading(false);
        })();
    }, []);

    /* ─── toggle favourite flag ─── */
    const toggleFavorite = useCallback(async (event_id, nowFav) => {
        await fetch("/api/user-event", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id, favorite: !nowFav }),
        });

        /* optimistic UI update + resort */
        setEvents(evs =>
            evs
                .map(ev =>
                    ev.event_id === event_id ? { ...ev, user_favorite: !nowFav } : ev,
                )
                .sort(
                    (a, b) =>
                        Number(b.user_favorite) - Number(a.user_favorite) ||
                        new Date(a.event_startdatetime) -
                        new Date(b.event_startdatetime),
                ),
        );
    }, []);

    /* ─── unsave ─── */
    const removeFromSaved = useCallback(async event_id => {
        await fetch(`/api/user-event?event_id=${event_id}`, { method: "DELETE" });
        setEvents(evs => evs.filter(ev => ev.event_id !== event_id));
    }, []);

    if (loading) return <p className="pt-24 px-4">Loading…</p>;
    if (!events.length) return <p className="pt-24 px-4">No saved events yet.</p>;

    return (
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
            <h1 className="text-3xl font-bold mb-8 text-center">My Saved Events</h1>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map(ev => (
                    <article
                        key={ev.event_id}
                        className="relative flex flex-col bg-white shadow rounded-xl p-5"
                    >
                        {/* ★ favourite toggle */}
                        <button
                            onClick={() => toggleFavorite(ev.event_id, ev.user_favorite)}
                            title={
                                ev.user_favorite ? "Remove favourite" : "Mark favourite"
                            }
                            className="absolute top-3 right-3 text-2xl text-yellow-500"
                        >
                            {ev.user_favorite ? <RiStarFill /> : <RiStarLine />}
                        </button>

                        {/* content */}
                        <h2 className="text-lg font-semibold line-clamp-1">
                            {ev.event_title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {new Date(ev.event_startdatetime).toLocaleString("en-AU", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                            {" – "}
                            {ev.venue_name || "Venue TBA"}
                        </p>
                        <p className="mt-2 text-gray-800 flex-1 line-clamp-3">
                            {ev.event_description}
                        </p>

                        {/* actions */}
                        <div className="mt-4 flex justify-end gap-2">
                            <Link
                                href={`/events/${ev.event_id}`}
                                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                View
                            </Link>
                            <button
                                onClick={() => removeFromSaved(ev.event_id)}
                                className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                            >
                                Remove
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
