/* File: src/app/saved/page.js */
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link   from "next/link";
import { RiStarLine, RiStarFill } from "react-icons/ri";

/* ─── helper for pretty AU dates ───────────────────────────────────────── */
const fmtDT = dt =>
    dt
        ? new Date(dt).toLocaleString("en-AU", {
            dateStyle: "medium",
            timeStyle: "short",
        })
        : "TBA";

/* ---------------------------------------------------------------------- */

export default function SavedEventsPage() {
    /* 1️⃣  your original internal “user-event” list ----------------------- */
    const [events,     setEvents]   = useState([]);
    const [evtLoad,    setEvtLoad]  = useState(true);

    useEffect(() => {
        (async () => {
            setEvtLoad(true);
            const data = await fetch("/api/user-event").then(r => r.json());
            data.sort(
                (a, b) =>
                    Number(b.user_favorite) - Number(a.user_favorite) ||
                    new Date(a.event_startdatetime) - new Date(b.event_startdatetime),
            );
            setEvents(data);
            setEvtLoad(false);
        })();
    }, []);

    const toggleFavorite = useCallback(async (id, fav) => {
        await fetch("/api/user-event", {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ event_id: id, favorite: !fav }),
        });
        setEvents(ev =>
            ev
                .map(e =>
                    e.event_id === id ? { ...e, user_favorite: !fav } : e,
                )
                .sort(
                    (a, b) =>
                        Number(b.user_favorite) - Number(a.user_favorite) ||
                        new Date(a.event_startdatetime) - new Date(b.event_startdatetime),
                ),
        );
    }, []);

    const removeUserEvent = useCallback(async id => {
        await fetch(`/api/user-event?event_id=${id}`, { method: "DELETE" });
        setEvents(ev => ev.filter(e => e.event_id !== id));
    }, []);

    /* 2️⃣  Eventfinda “+”-saved list -------------------------------------- */
    const [efRows,   setEfRows]  = useState([]);
    const [efLoad,   setEfLoad]  = useState(true);

    useEffect(() => {
        (async () => {
            setEfLoad(true);
            const rows = await fetch("/api/saved-event").then(r => r.json());
            setEfRows(rows);             // already newest-first
            setEfLoad(false);
        })();
    }, []);

    const removeEf = useCallback(async id => {
        await fetch(`/api/saved-event?event_id=${id}`, { method: "DELETE" });
        setEfRows(r => r.filter(e => e.event_id !== id));
    }, []);

    /* -------------------------------------------------------------------- */
    return (
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-20">
            {/* ================================================================ */}
            {/* Section A – internal user-event saves                           */}
            {/* ================================================================ */}
            <section>
                <h1 className="text-3xl font-bold mb-8 text-center">My Saved Events</h1>

                {evtLoad && <p className="text-center">Loading…</p>}
                {!evtLoad && !events.length && (
                    <p className="text-center">No saved events yet.</p>
                )}

                {!evtLoad && events.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {events.map(ev => (
                            <article
                                key={ev.event_id}
                                className="relative flex flex-col bg-white shadow rounded-xl p-5"
                            >
                                {/* ★ favourite */}
                                <button
                                    onClick={() => toggleFavorite(ev.event_id, ev.user_favorite)}
                                    title={ev.user_favorite ? "Remove favourite" : "Mark favourite"}
                                    className="absolute top-3 right-3 text-2xl text-yellow-500"
                                >
                                    {ev.user_favorite ? <RiStarFill /> : <RiStarLine />}
                                </button>

                                {/* content */}
                                <h2 className="text-lg font-semibold line-clamp-1">
                                    {ev.event_title}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {fmtDT(ev.event_startdatetime)} — {ev.venue_name || "Venue TBA"}
                                </p>
                                <p className="mt-2 text-gray-800 flex-1 line-clamp-3">
                                    {ev.event_description}
                                </p>

                                {/* actions */}
                                <div className="mt-4 flex justify-end gap-2">
                                    <Link
                                        href={`/events/${ev.event_id}/edit`}
                                        className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => removeUserEvent(ev.event_id)}
                                        className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* ================================================================ */}
            {/* Section B – Eventfinda “+”-saved events                          */}
            {/* ================================================================ */}
            <section>
                <h2 className="text-2xl font-bold mb-8 text-center">
                    Saved Eventfinda Events
                </h2>

                {efLoad && <p className="text-center">Loading…</p>}
                {!efLoad && !efRows.length && (
                    <p className="text-center">
                        No Eventfinda events saved yet.
                    </p>
                )}

                {!efLoad && efRows.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {efRows.map(ev => (
                            <article
                                key={ev.event_id}
                                className="relative flex flex-col bg-white shadow rounded-xl overflow-hidden"
                            >
                                {/* thumbnail */}
                                {ev.thumbnail_url && (
                                    <div className="relative w-full h-40">
                                        <Image
                                            src={ev.thumbnail_url}
                                            alt={ev.event_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* info */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-semibold line-clamp-2">
                                        {ev.event_name}
                                    </h3>

                                    {/* date columns */}
                                    <p className="mt-1 text-sm text-gray-600">
                                        {fmtDT(ev.datetime_start)}
                                        {ev.datetime_end && (
                                            <>
                                                {" – "}
                                                {fmtDT(ev.datetime_end)}
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Saved {fmtDT(ev.created_at)}
                                    </p>

                                    {/* actions */}
                                    <div className="mt-auto pt-4 flex justify-end gap-2">
                                        <Link
                                            href={ev.event_url}
                                            target="_blank"
                                            className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        >
                                            Event page
                                        </Link>
                                        <button
                                            onClick={() => removeEf(ev.event_id)}
                                            className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
