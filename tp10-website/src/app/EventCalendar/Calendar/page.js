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

const locales = { "en-AU": enAU };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

/**
 * IMPORTANT: ensure the variable begins with NEXT_PUBLIC_ so it reaches the browser.
 * Add `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...` to your .env.local and restart next.
 */
const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

/* ─── custom toolbar with arrows + view buttons ───────────────────── */
function CalendarToolbar({ label, onNavigate, onView, view, views }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            {/* left controls */}
            <div className="flex items-center gap-2">
                <button
                    aria-label="Previous"
                    onClick={() => onNavigate("PREV")}
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <RiArrowLeftLine size={20} />
                </button>

                <span className="font-semibold text-lg select-none">{label}</span>

                <button
                    aria-label="Next"
                    onClick={() => onNavigate("NEXT")}
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <RiArrowRightLine size={20} />
                </button>
            </div>

            {/* view switcher */}
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

export default function CalendarPage() {
    const router = useRouter();
    const [events, setEvents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    const [saved,   setSaved]   = useState(false);
    const [saving,  setSaving]  = useState(false);

    /* ─── fetch events ───────────────────────────────────────── */
    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            const raw = await fetch("/api/event/").then(r => r.json());
            if (ignore) return;
            setEvents(
                raw.map(ev => ({
                    id:     ev.event_id,
                    title:  ev.event_title,
                    start:  new Date(ev.event_startdatetime),
                    end:    new Date(ev.event_enddatetime || ev.event_startdatetime),
                    allDay: false,
                    resource: ev,
                }))
            );
            setLoading(false);
        })();
        return () => { ignore = true; };
    }, []);

    /* ─── compute saved flag for the modal ─────────────── */
    useEffect(() => {
        if (!selected) return;
        (async () => {
            try {
                const list = await fetch("/api/user-event").then(r => r.json());
                setSaved(list.some(ev => ev.event_id === selected.event_id));
            } catch (err) {
                console.error(err);
                setSaved(false);
            }
        })();
    }, [selected]);

    /* ─── toggle save/unsave ───────────────────────────── */
    const toggleSave = useCallback(async () => {
        if (!selected || saving) return;
        setSaving(true);
        try {
            if (saved) {
                await fetch(`/api/user-event?event_id=${selected.event_id}`, { method: "DELETE" });
                setSaved(false);
            } else {
                await fetch("/api/user-event", {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({ event_id: selected.event_id }),
                });
                setSaved(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }, [selected, saved, saving]);

    /* ─── calendar event style ─────────────────────────── */
    const eventStyleGetter = () => ({
        style: {
            backgroundColor: "#039be5",
            borderRadius:    "4px",
            color:           "#fff",
            border:          0,
            display:         "block",
        },
    });

    /* ─── create new event via slot selection ─────────── */
    const handleCreate = useCallback(
        slot => {
            const s = slot.start.toISOString();
            const e = (slot.end || addMinutes(slot.start, 30)).toISOString();
            router.push(`/events/create?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`);
        },
        [router]
    );

    return (
        <main className="min-h-screen bg-gray-50 pt-24 px-2 md:px-6">
            <h1 className="text-2xl font-bold mb-4 text-center">All Events</h1>

            {/* ─── calendar ──────────────────────────────── */}
            <div className="relative z-0">
                <BigCalendar
                    localizer={localizer}
                    events={events}
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
            </div>

            {/* ─── event details modal ───────────────────── */}
            {selected && (
                <Modal isOpen onClose={() => setSelected(null)} title={selected.event_title}>
                    <div className="space-y-2 text-black">
                        <p className="font-semibold">
                            {new Date(selected.event_startdatetime).toLocaleString()}–
                            {new Date(selected.event_enddatetime ?? selected.event_startdatetime).toLocaleString()}
                        </p>
                        <p>{selected.event_description ?? "No description"}</p>

                        {/* Venue details */}
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

                        {/* ─── map (only if we have a place_id OR address) ─── */}
                        {(() => {
                            if (
                                !googleKey ||
                                !(selected.venue_place_id || selected.venue_address)
                            ) return null;

                            const url = new URL("https://www.google.com/maps/embed/v1/place");
                            url.searchParams.set("key", googleKey);

                            if (selected.venue_place_id) {
                                url.searchParams.set("q", `place_id:${selected.venue_place_id}`);
                            } else {
                                url.searchParams.set("q", selected.venue_address);
                            }

                            const mapSrc = url.toString();
                            return (
                                <>
                                    <div className="w-full aspect-video mt-2 rounded-lg overflow-hidden shadow">
                                        <iframe
                                            title="Venue location map"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={mapSrc}
                                        />
                                    </div>
                                </>
                            );
                        })()}

                        {/* Save / open buttons */}
                        <button
                            onClick={toggleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium px-4 py-2 rounded-lg"
                        >
                            {saved ? <RiBookmarkFill /> : <RiBookmarkLine />}
                            {saved ? "Un-save event" : "Save event"}
                        </button>
                    </div>
                </Modal>
            )}

            {loading && <p className="text-center text-gray-500 mt-4">Loading events…</p>}
        </main>
    );
}
