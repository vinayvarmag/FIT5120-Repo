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

import Modal       from "@/components/Modal";
import { useRouter } from "next/navigation";
import {RiBookmarkFill, RiBookmarkLine} from "react-icons/ri";

const locales = { "en-AU": enAU };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function CalendarPage() {
    const router = useRouter();
    const [events,   setEvents]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [selected, setSelected] = useState(null);

    const [saved,    setSaved]    = useState(false);
    const [saving,   setSaving]   = useState(false);

    /* -- fetch every event -------------- */
    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            const raw = await fetch("/api/event").then(r => r.json());
            if (ignore) return;

            setEvents(
                raw.map(ev => ({
                    id:     ev.event_id,
                    title:  ev.event_title,
                    start:  new Date(ev.event_startdatetime),
                    end:    new Date(ev.event_enddatetime || ev.event_startdatetime),
                    allDay: false,
                    resource: ev,
                })),
            );
            setLoading(false);
        })();
        return () => { ignore = true; };
    }, []);

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

    /* -- toggle save / unsave ------------------------- */
    const toggleSave = useCallback(async () => {
        if (!selected || saving) return;
        setSaving(true);

        try {
            if (saved) {
                await fetch(
                    `/api/user-event?event_id=${selected.event_id}`,
                    { method: "DELETE" },
                );
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

    /* -- Google‑style colour blocks ------ */
    const eventStyleGetter = () => ({
        style: {
            backgroundColor: "#039be5",
            borderRadius:    "4px",
            color:           "#fff",
            border:          0,
            display:         "block",
        },
    });

    /* ------ creating an event via slot selection --------- */
    const handleCreate = useCallback(slot => {
        // slot.start / slot.end are Date objects
        const s = slot.start.toISOString();
        const e = slot.end  ? slot.end.toISOString()
            : addMinutes(slot.start, 30).toISOString();
        router.push(`/events/create?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`);
    }, [router]);

    return (
        <main className="min-h-screen bg-gray-50 pt-24 px-2 md:px-6">
            <h1 className="text-2xl font-bold mb-4 text-center">My Events</h1>

            <div className="relative z-0"> {/* keep toolbar above navbar */}
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.MONTH}
                    views={['month', 'week', 'day', 'agenda']}
                    style={{ height: "80vh" }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={ev => setSelected(ev.resource)}
                    onDoubleClickEvent={ev => router.push(`/events/${ev.id}`)}
                    selectable
                    onSelectSlot={handleCreate}
                    popup
                />
            </div>

            {/* ── info‑modal ─────────────────────────────── */}
            {selected && (
                <Modal
                    isOpen
                    onClose={() => setSelected(null)}
                    title={selected.event_title}
                >
                    <div className="space-y-2 text-black">
                        <p className="font-semibold">
                            {new Date(selected.event_startdatetime).toLocaleString()}–
                            {new Date(selected.event_enddatetime ?? selected.event_startdatetime)
                                .toLocaleString()}
                        </p>
                        <p>{selected.event_description ?? "No description"}</p>
                        <p className="text-sm text-gray-600">
                            Venue ID: {selected.venue_id ?? "TBA"}
                        </p>
                        <button
                            onClick={toggleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium px-4 py-2 rounded-lg"
                        >
                            {saved ? <RiBookmarkFill /> : <RiBookmarkLine />}
                            {saved ? "Un‑save event" : "Save event"}
                        </button>

                        <button
                            onClick={() => {
                                setSelected(null);
                                router.push(`/events/${selected.event_id}`);
                            }}
                            className="mt-4 bg-purple-700 hover:bg-purple-800 text-white rounded-lg px-4 py-2"
                        >
                            Open full details
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
