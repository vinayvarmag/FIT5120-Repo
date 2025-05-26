/* File: src/app/…/PopularClient.js */
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image       from "next/image";
import Link        from "next/link";
import dayjs       from "dayjs";
import { RiAddLine, RiCheckFill } from "react-icons/ri";
import Modal       from "@/components/Modal";

/* ── Eventfinda paging settings ─────────────────────────── */
const ROWS_PER_PAGE = 100;   // Eventfinda maximum
const MAX_PAGES     = 30;    // failsafe hard stop

/* ── pick a sensible image from nested transforms ───────── */
function getImageUrl(ev) {
    if (ev.image_url) return ev.image_url;

    const imgObj     = ev.images?.images?.[0];
    const transforms = imgObj?.transforms?.transforms ?? [];
    const preferred  = transforms.find(t => t.width >= 350) ?? transforms[0];

    return preferred?.url || imgObj?.original_url || "/placeholder.jpg";
}

/* ───────────────────────────────────────────────────────── */
export default function MelbourneEventsClient({ userId }) {
    const router          = useRouter();
    const isAuthenticated = Boolean(userId);

    /* STATE ------------------------------------------------ */
    const [categories, setCategories] = useState([]);
    const [catId,      setCatId]      = useState("");
    const [events,     setEvents]     = useState([]);
    const [saved,      setSaved]      = useState(new Set());
    const [loading,    setLoading]    = useState(true);
    const [loginOpen,  setLoginOpen]  = useState(false);

    /* our own grid paging */
    const pageSize  = 9;
    const [page, setPage] = useState(1);
    const pageCount = useMemo(
        () => Math.max(1, Math.ceil(events.length / pageSize)),
        [events.length],
    );

    /* ── fetch category list once ────────────────────────── */
    useEffect(() => {
        fetch("/api/eventfinda/categories")
            .then(r => r.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    /* ── fetch *all* events for current filter ───────────── */
    useEffect(() => {
        let abort = false;
        (async () => {
            setLoading(true);
            setPage(1);

            const base = "/api/eventfinda/melbourne";
            const all  = [];

            for (let apiPage = 1; apiPage <= MAX_PAGES; apiPage++) {
                if (abort) break;

                const qs = new URLSearchParams({
                    page: String(apiPage),
                    rows: String(ROWS_PER_PAGE),
                });
                if (catId) qs.set("category", catId);

                const res = await fetch(`${base}?${qs}`);
                if (!res.ok) break;

                const chunk = await res.json();
                const list  = Array.isArray(chunk) ? chunk : [];

                if (!list.length) break;           // no more data
                all.push(...list);

                if (list.length < ROWS_PER_PAGE) break; // last page reached
            }

            if (!abort) setEvents(all);
            setLoading(false);
        })();

        return () => { abort = true; };
    }, [catId]);

    /* ── fetch IDs already saved by the user ─────────────── */
    useEffect(() => {
        fetch("/api/saved-event")
            .then(r => r.json())
            .then(rows => setSaved(new Set(rows.map(r => r.event_id))))
            .catch(() => setSaved(new Set()));
    }, []);

    /* ── save handler (stores full session list) ─────────── */
    const saveEvent = useCallback(async ev => {
        const sessions = ev.sessions?.sessions ?? [];
        const sessionTimes = sessions.map(s => ({
            start: s.datetime_start,
            end:   s.datetime_end,
        }));

        try {
            await fetch("/api/saved-event", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id:       ev.id,
                    event_name:     ev.name,
                    event_url:      ev.url,
                    thumbnail_url:  getImageUrl(ev),
                    datetime_start: ev.datetime_start,
                    datetime_end:   ev.datetime_end,
                    session_times:  sessionTimes,
                }),
            });
            setSaved(prev => new Set(prev).add(ev.id));
        } catch (err) {
            console.error(err);
            alert("Couldn’t save the event — please try again.");
        }
    }, []);

    /* slice data for current grid page */
    const pagedEvents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return events.slice(start, start + pageSize);
    }, [events, page]);

    /* ────────────────────────────────────────────────────── */
    /*  RENDER                                               */
    /* ────────────────────────────────────────────────────── */
    return (
        <main className="flex flex-col min-h-screen">

            {/* Hero banner */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                <Image
                    src="/melbourne.jpg"
                    alt="Melbourne skyline at dusk"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center">
                        Popular Events
                    </h1>
                    <p className="max-w-3xl text-white text-lg font-semibold text-center">
                        Discover what’s on around the city right now. Filter by category and browse every session.
                    </p>
                </div>
            </section>

            {/* Filter + card grid */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-24">

                {/* Category filter */}
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

                {/* Loader / empty states */}
                {loading && <p className="text-center p-8">Loading…</p>}
                {!loading && !events.length && (
                    <p className="text-center p-8 text-zinc-500">No events found.</p>
                )}

                {/* Card grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pagedEvents.map(ev => {
                        const sessions = ev.sessions?.sessions ?? [];
                        return (
                            <article key={ev.id} className="relative">
                                {/* Save button */}
                                <button
                                    aria-label={saved.has(ev.id) ? "Saved" : "Save event"}
                                    onClick={e => {
                                        e.preventDefault();
                                        if (!isAuthenticated) {
                                            setLoginOpen(true);
                                        } else if (!saved.has(ev.id)) {
                                            saveEvent(ev);
                                        }
                                    }}
                                    className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow"
                                >
                                    {saved.has(ev.id) ? (
                                        <RiCheckFill className="text-green-600 text-lg" />
                                    ) : (
                                        <RiAddLine className="text-indigo-600 text-lg" />
                                    )}
                                </button>

                                {/* Card link */}
                                <Link
                                    href={ev.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white"
                                >
                                    {/* Image */}
                                    <div className="relative w-full h-48">
                                        <Image
                                            src={getImageUrl(ev)}
                                            alt={ev.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Copy */}
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-semibold line-clamp-2">{ev.name}</h3>

                                        {/* Session list */}
                                        {sessions.length ? (
                                            <ul className="text-sm text-zinc-700 space-y-1 max-h-28 overflow-y-auto pr-1">
                                                {sessions.map(s => (
                                                    <li key={s.id}>
                                                        {dayjs(s.datetime_start).format("ddd D MMM, h:mma")}{" "}
                                                        – {dayjs(s.datetime_end).format("h:mma")}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-zinc-500">No sessions listed.</p>
                                        )}

                                        <p className="text-sm font-medium text-indigo-600">
                                            View on Eventfinda
                                        </p>
                                    </div>
                                </Link>
                            </article>
                        );
                    })}
                </div>

                {/* Grid pagination controls */}
                {pageCount > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg bg-purple-900 text-white disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="font-medium">
                            Page {page} of {pageCount}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                            disabled={page === pageCount}
                            className="px-4 py-2 rounded-lg bg-purple-900 text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                <p className="mt-16 text-center text-sm">
                    <strong>Disclaimer:</strong> The platform provides third-party event information for
                    reference only. Always confirm details with official sources.
                </p>
            </section>

            {/* Login-required modal */}
            <Modal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
                title="Login Required"
            >
                <div className="space-y-4 text-black">
                    <p>You need to log in to save events.</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setLoginOpen(false)}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="px-4 py-2 rounded-lg bg-purple-900 text-white hover:bg-purple-700"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </Modal>
        </main>
    );
}
