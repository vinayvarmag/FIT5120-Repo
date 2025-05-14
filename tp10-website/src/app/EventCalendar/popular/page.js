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
            const data = await fetch("/api/event/popular").then(r => r.json());
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

        /* optimistic UI update */
        setEvents(evs =>
            evs
                .map(ev =>
                    ev.event_id === event_id
                        ? { ...ev, user_favorite: !nowFav }
                        : ev,
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
    const removeFromSaved = useCallback(async (event_id) => {
        await fetch(`/api/user-event?event_id=${event_id}`, { method: "DELETE" });
        setEvents(evs => evs.filter(ev => ev.event_id !== event_id));
    }, []);

    if (loading) return <p className="pt-24 px-4">Loading…</p>;
    if (!events.length) return <p className="pt-24 px-4">No saved events yet.</p>;

    return (
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-8 space-y-6">
            <h1 className="text-3xl font-bold mb-4 text-center">My Saved Events</h1>

            {events.map(ev => (
                <article
                    key={ev.event_id}
                    className="flex items-start bg-white shadow rounded-lg p-4 gap-4"
                >
                    <button
                        className="text-xl mt-1"
                        onClick={() => toggleFavorite(ev.event_id, ev.user_favorite)}
                        title={ev.user_favorite ? "Un‑favourite" : "Mark favourite"}
                    >
                        {ev.user_favorite ? <RiStarFill /> : <RiStarLine />}
                    </button>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold truncate">
                            {ev.event_title}
                        </h2>
                        <p className="text-sm text-gray-600 truncate">
                            {new Date(ev.event_startdatetime).toLocaleString("en-AU", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                            {" – "}
                            {ev.venue_name || "Venue TBA"}
                        </p>
                        <p className="mt-2 text-gray-800 line-clamp-2">
                            {ev.event_description}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <Link
                            className="text-blue-600 hover:underline"
                            href={`/events/${ev.event_id}`}
                        >
                            View
                        </Link>
                        <button
                            onClick={() => removeFromSaved(ev.event_id)}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                </article>
            ))}
        </main>
    );
}
