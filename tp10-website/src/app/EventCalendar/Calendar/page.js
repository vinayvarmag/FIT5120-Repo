/* File: src/app/calendar/page.js */
"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Calendar as BigCalendar,
    dateFnsLocalizer,
    Views,
} from "react-big-calendar";
import {
    format,
    parse,
    startOfWeek,
    getDay,
    addMinutes,
} from "date-fns";
import enAU from "date-fns/locale/en-AU";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import {
    RiBookmarkFill,
    RiBookmarkLine,
    RiArrowLeftLine,
    RiArrowRightLine,
} from "react-icons/ri";

/* ── date-fns localiser ─────────────────────────────────────────── */
const locales   = { "en-AU": enAU };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

/* Google Maps iframe key (optional) */
const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

/* ── custom toolbar (prev/next & view buttons) ─────────────────── */
function CalendarToolbar({ label, onNavigate, onView, view, views }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onNavigate("PREV")}
                    className="p-2 rounded-full hover:bg-gray-200"
                >
                    <RiArrowLeftLine size={20} />
                </button>
                <span className="font-semibold text-lg select-none">{label}</span>
                <button
                    onClick={() => onNavigate("NEXT")}
                    className="p-2 rounded-full hover:bg-gray-200"
                >
                    <RiArrowRightLine size={20} />
                </button>
            </div>

            <div className="flex items-center gap-1">
                {views.map(v => (
                    <button
                        key={v}
                        onClick={() => onView(v)}
                        className={`px-3 py-1 rounded-md text-sm capitalize ${
                            view === v
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ───────────────────────────────────────────────────────────────── */
export default function CalendarPage() {
    const router = useRouter();

    /* datasets ------------------------------------------------------ */
    const [allEvents,  setAllEvents]  = useState([]);  // /api/event/all
    const [userEvents, setUserEvents] = useState([]);  // /api/event     (mine)

    /* UI state ------------------------------------------------------ */
    const [viewMode, setViewMode] = useState("all");   // "all" | "mine"
    const [loading,  setLoading]  = useState(true);
    const [selected, setSelected] = useState(null);    // event in modal

    const [saved,  setSaved]  = useState(false);       // bookmark state
    const [saving, setSaving] = useState(false);       // network lock

    /* ── fetch ALL events once ────────────────────────────────────── */
    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            const raw = await fetch("/api/event/all").then(r => r.json());
            if (ignore) return;

            setAllEvents(
                raw.map(ev => ({
                    id:    ev.event_id,
                    title: ev.event_title,
                    start: new Date(ev.event_startdatetime),
                    end:   new Date(ev.event_enddatetime ?? ev.event_startdatetime),
                    resource: ev,
                }))
            );
            setLoading(false);
        })();
        return () => { ignore = true; };
    }, []);

    /* ── lazy-load MY events the first time user switches ─────────── */
    const loadUserEvents = useCallback(async () => {
        if (userEvents.length) return;
        setLoading(true);
        const raw = await fetch("/api/event").then(r => r.json());
        setUserEvents(
            raw.map(ev => ({
                id:    ev.event_id,
                title: ev.event_title,
                start: new Date(ev.event_startdatetime),
                end:   new Date(ev.event_enddatetime ?? ev.event_startdatetime),
                resource: ev,
            }))
        );
        setLoading(false);
    }, [userEvents.length]);

    useEffect(() => {
        if (viewMode === "mine") loadUserEvents();
    }, [viewMode, loadUserEvents]);

    /* ── check bookmark status when modal opens ───────────────────── */
    useEffect(() => {
        if (!selected) return;
        (async () => {
            try {
                const list = await fetch("/api/user-event").then(r => r.json());
                setSaved(list.some(ev => ev.event_id === selected.event_id));
            } catch {
                setSaved(false);
            }
        })();
    }, [selected]);

    /* ── save / unsave current event ──────────────────────────────── */
    const toggleSave = useCallback(async () => {
        if (!selected || saving) return;
        setSaving(true);

        try {
            if (saved) {
                /* DELETE */
                await fetch(`/api/user-event?event_id=${selected.event_id}`, {
                    method: "DELETE",
                });
                setSaved(false);
            } else {
                /* POST with full details */
                await fetch("/api/user-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_id:       selected.event_id,
                        event_name:     selected.event_title          ?? "Untitled event",
                        event_url:      selected.event_url            ?? `${location.origin}/events/${selected.event_id}`,
                        thumbnail_url:  selected.thumbnail_url        ?? selected.event_image ?? null,
                        datetime_start: selected.event_startdatetime  ?? null,
                        datetime_end:   selected.event_enddatetime    ?? null,
                    }),
                });
                setSaved(true);
            }
        } finally {
            setSaving(false);
        }
    }, [selected, saved, saving]);

    /* ── colour helper ─────────────────────────────────────────────── */
    const eventStyleGetter = () => ({
        style: { backgroundColor: "#039be5", borderRadius: "4px", color: "#fff" },
    });

    /* ── quick-create (double-click empty slot) ────────────────────── */
    const handleCreate = useCallback(
        slot => {
            const s = slot.start.toISOString();
            const e = (slot.end || addMinutes(slot.start, 30)).toISOString();
            router.push(
                `/events/create?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`
            );
        },
        [router]
    );

    const calendarEvents = viewMode === "all" ? allEvents : userEvents;

    /* ──────────────────────────────────────────────────────────────── */
    return (
        <main className="min-h-screen bg-gray-50 pt-24 px-2 md:px-6">
            <div className=" text-center mb-4">
                <h1 className="text-4xl font-bold text-center">
                    Event Calendar
                </h1>
            </div>
            {/* view-mode toggle */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => setViewMode("all")}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        viewMode === "all"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                >
                    All Events
                </button>
                <button
                    onClick={() => setViewMode("mine")}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        viewMode === "mine"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                >
                    My Events
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-center">
                {viewMode === "all" ? "All Events" : "My Events"}
            </h1>

            {/* calendar widget */}
            <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.MONTH}
                views={["month", "week", "day", "agenda"]}
                style={{ height: "80vh" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={ev => setSelected(ev.resource)}
                onDoubleClickEvent={ev => router.push(`/events/${ev.id}`)}
                selectable
                onSelectSlot={handleCreate}
                popup
                components={{ toolbar: CalendarToolbar }}
            />

            {/* modal with details */}
            {selected && (
                <Modal
                    isOpen
                    onClose={() => setSelected(null)}
                    title={selected.event_title}
                >
                    <div className="space-y-2 text-black">
                        <p className="font-semibold">
                            {new Date(selected.event_startdatetime).toLocaleString()} –{" "}
                            {new Date(
                                selected.event_enddatetime ?? selected.event_startdatetime
                            ).toLocaleString()}
                        </p>

                        <p>{selected.event_description ?? "No description"}</p>

                        {selected.venue_name && (
                            <p className="text-sm text-gray-600">
                                <strong>Venue:</strong> {selected.venue_name}
                            </p>
                        )}
                        {selected.venue_address && (
                            <p className="text-sm text-gray-600">
                                <strong>Address:</strong> {selected.venue_address}
                            </p>
                        )}

                        {googleKey &&
                            (selected.venue_place_id || selected.venue_address) && (
                                <div className="w-full aspect-video mt-2 rounded-lg overflow-hidden shadow">
                                    <iframe
                                        title="Venue location map"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={(() => {
                                            const url = new URL(
                                                "https://www.google.com/maps/embed/v1/place"
                                            );
                                            url.searchParams.set("key", googleKey);
                                            url.searchParams.set(
                                                "q",
                                                selected.venue_place_id
                                                    ? `place_id:${selected.venue_place_id}`
                                                    : selected.venue_address
                                            );
                                            return url.toString();
                                        })()}
                                    />
                                </div>
                            )}

                        <button
                            onClick={toggleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200
                         text-purple-800 font-medium px-4 py-2 rounded-lg"
                        >
                            {saved ? <RiBookmarkFill /> : <RiBookmarkLine />}
                            {saved ? "Un-save event" : "Save event"}
                        </button>
                    </div>
                </Modal>
            )}

            {loading && (
                <p className="text-center text-gray-500 mt-4">Loading events…</p>
            )}
        </main>
    );
}
