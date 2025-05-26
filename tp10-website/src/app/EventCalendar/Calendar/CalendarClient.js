// File: src/app/calendar/CalendarClient.js
"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Calendar as BigCalendar,
    dateFnsLocalizer,
    Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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

/* ────────── date-fns localiser ──────────────────────────────── */
const locales   = { "en-AU": enAU };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarClient({ userId }) {
    const router          = useRouter();
    const isAuthenticated = Boolean(userId);
    const googleKey       = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    /* ────────── DATA ────────────────────────────────────────── */
    const [allEvents,   setAllEvents]   = useState([]);
    const [userEvents,  setUserEvents]  = useState([]);
    const [savedEvents, setSavedEvents] = useState([]);

    /* ────────── UI state ────────────────────────────────────── */
    // viewMode: "all" | "mine" | "saved" | "locked"
    const [viewMode,    setViewMode]    = useState("all");
    const [loading,     setLoading]     = useState(false);
    const [selected,    setSelected]    = useState(null);
    const [saved,       setSaved]       = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [loginPrompt, setLoginPrompt] = useState(false);

    /* ────────── LOAD “ALL” EVENTS (once) ────────────────────── */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/event/all");
                const raw = await res.json();
                setAllEvents(
                    raw.map(ev => ({
                        id:        ev.event_id,          // <- BigCalendar key
                        event_id:  ev.event_id,          // <- keep for save/unsave
                        title:     ev.event_title,
                        start:     new Date(ev.event_startdatetime),
                        end:       new Date(ev.event_enddatetime || ev.event_startdatetime),
                        calendarType: "all",
                        resource:  { ...ev, calendarType: "all" },
                    })),
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ────────── LOAD “MY” EVENTS (on demand) ────────────────── */
    useEffect(() => {
        if (viewMode !== "mine" || !isAuthenticated) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/event");
                const raw = await res.json();
                setUserEvents(
                    raw.map(ev => ({
                        id:        ev.event_id,
                        event_id:  ev.event_id,
                        title:     ev.event_title,
                        start:     new Date(ev.event_startdatetime),
                        end:       new Date(ev.event_enddatetime || ev.event_startdatetime),
                        calendarType: "mine",
                        resource:  { ...ev, calendarType: "mine" },
                    })),
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [viewMode, isAuthenticated]);

    /* ────────── LOAD “SAVED / EVENTFINDA” EVENTS ────────────── */
    useEffect(() => {
        if (viewMode !== "saved" || !isAuthenticated) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/saved-event");
                const raw = await res.json();
                setSavedEvents(
                    raw.map(ev => ({
                        id:        ev.id,               // primary-key in saved table
                        event_id:  ev.id,               // keep uniform field name
                        title:     ev.event_name,
                        start:     new Date(ev.datetime_start),
                        end:       new Date(ev.datetime_end || ev.datetime_start),
                        calendarType: "saved",
                        resource:  { ...ev, calendarType: "saved" },
                    })),
                );
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [viewMode, isAuthenticated]);

    /* ────────── CUSTOM TOOLBAR ──────────────────────────────── */
    function CalendarToolbar({ label, onNavigate, onView, view, views }) {
        const viewNames = Array.isArray(views) ? views : Object.keys(views);
        return (
            <div className="flex items-center justify-between mb-4">
                {/* ← / month label / → */}
                <div className="flex items-center space-x-2">
                    <button onClick={() => onNavigate("PREV")} className="p-2 rounded-full hover:bg-gray-200">
                        <RiArrowLeftLine size={20} />
                    </button>
                    <span className="font-semibold text-lg select-none">{label}</span>
                    <button onClick={() => onNavigate("NEXT")} className="p-2 rounded-full hover:bg-gray-200">
                        <RiArrowRightLine size={20} />
                    </button>
                </div>

                {/* month / week / day / agenda */}
                <div className="flex space-x-1">
                    {viewNames.map(v => (
                        <button
                            key={v}
                            onClick={() => onView(v)}
                            className={`px-3 py-1 rounded-md text-sm capitalize ${
                                view === v ? "bg-purple-900 text-white" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ────────── VIEW TOGGLES ───────────────────────────────── */
    const handleViewAll   = () => setViewMode("all");
    const handleViewMine  = () => (isAuthenticated ? setViewMode("mine")  : setViewMode("locked"));
    const handleViewSaved = () => (isAuthenticated ? setViewMode("saved") : setViewMode("locked"));

    /* ────────── SELECT EVENT ───────────────────────────────── */
    const handleSelectEvent = useCallback(
        ev => {
            if (!isAuthenticated) {
                setLoginPrompt(true);
                return;
            }
            setSelected(ev);
            setSaved(ev.calendarType === "saved");
        },
        [isAuthenticated],
    );

    /* ────────── SAVE / UNSAVE TOGGLE ───────────────────────── */
    const toggleSave = useCallback(async () => {
        if (!selected || saving) return;
        setSaving(true);
        try {
            if (saved) {
                await fetch(`/api/saved-event?event_id=${selected.event_id}`, { method: "DELETE" });
                setSavedEvents(list => list.filter(e => e.event_id !== selected.event_id));
                setSaved(false);
            } else {
                await fetch("/api/saved-event", {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_id:       selected.event_id,
                        event_name:     selected.title,
                        event_url:      selected.event_url,
                        thumbnail_url:  selected.thumbnail_url,
                        datetime_start: selected.start,
                        datetime_end:   selected.end,
                    }),
                });
                setSaved(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }, [selected, saved, saving]);

    /* ────────── COLOUR-CODE BY SOURCE ──────────────────────── */
    const eventPropGetter = event => {
        const type = event.calendarType ?? event.resource?.calendarType;
        let bg = "#DDC5E3";          // default “all” + “mine”
        if (type === "saved") bg = "#DDC5E3";
        return {
            style: {
                backgroundColor: bg,
                color:           "#000",
                borderRadius:    4,
                border:          "none",
            },
        };
    };

    /* ────────── MAIN RENDER ───────────────────────────────── */
    return (
        <main className="min-h-screen p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Event Calendar</h1>

            {/* TAB BUTTONS */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    onClick={handleViewAll}
                    className={`px-4 py-2 rounded-lg ${viewMode === "all"   ? "bg-purple-900 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    All Events
                </button>
                <button
                    onClick={handleViewMine}
                    className={`px-4 py-2 rounded-lg ${viewMode === "mine"  ? "bg-purple-900 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    My Events
                </button>
                <button
                    onClick={handleViewSaved}
                    className={`px-4 py-2 rounded-lg ${viewMode === "saved" ? "bg-purple-900 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                    Eventfinda&nbsp;(Saved)
                </button>
            </div>

            {/* LOCKED MESSAGE */}
            {viewMode === "locked" && !isAuthenticated ? (
                <div className="text-center p-6">
                    <p className="text-lg">
                        You must&nbsp;
                        <a href="/login" className="underline text-purple-700">log in</a>
                        &nbsp;to view this tab.
                    </p>
                </div>
            ) : (
                <BigCalendar
                    localizer       = {localizer}
                    events          = {viewMode === "all"
                        ? allEvents
                        : viewMode === "mine"
                            ? userEvents
                            : savedEvents}
                    startAccessor   = "start"
                    endAccessor     = "end"
                    defaultView     = {Views.MONTH}
                    views           = {["month", "week", "day", "agenda"]}
                    style           = {{ height: "80vh" }}
                    onSelectEvent   = {handleSelectEvent}
                    components      = {{ toolbar: CalendarToolbar }}
                    eventPropGetter = {eventPropGetter}
                />
            )}

            {/* EVENT MODAL */}
            {selected && (
                <Modal
                    isOpen
                    onClose={() => setSelected(null)}
                    title={selected.title}
                >
                    <div className="space-y-2 text-black">
                        <p className="font-semibold">
                            {selected.start.toLocaleString()}
                            {" – "}
                            {selected.end.toLocaleString()}
                        </p>

                        {selected.event_description && <p>{selected.event_description}</p>}
                        {selected.venue_name     && <p className="text-sm"><strong>Venue:</strong> {selected.venue_name}</p>}
                        {selected.venue_address  && <p className="text-sm"><strong>Address:</strong> {selected.venue_address}</p>}

                        {/* optional embedded map */}
                        {googleKey && (selected.venue_place_id || selected.venue_address) && (
                            <div className="w-full aspect-video mt-2 rounded-lg overflow-hidden shadow">
                                <iframe
                                    title="Venue location"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={() => {
                                        const url = new URL("https://www.google.com/maps/embed/v1/place");
                                        url.searchParams.set("key", googleKey);
                                        url.searchParams.set(
                                            "q",
                                            selected.venue_place_id
                                                ? `place_id:${selected.venue_place_id}`
                                                : selected.venue_address,
                                        );
                                        return url.toString();
                                    }}
                                />
                            </div>
                        )}

                        <button
                            onClick={toggleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-purple-900 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg"
                        >
                            {saved ? <RiBookmarkFill /> : <RiBookmarkLine />}
                            {saved ? "Un-save event" : "Save event"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* LOGIN PROMPT MODAL */}
            {loginPrompt && (
                <Modal
                    isOpen
                    onClose={() => setLoginPrompt(false)}
                    title="Login Required"
                >
                    <div className="space-y-4 text-center text-black">
                        <p>You must be logged in to view event details.</p>
                        <button
                            onClick={() => router.push("/login")}
                            className="bg-purple-900 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg"
                        >
                            Go to Login
                        </button>
                    </div>
                </Modal>
            )}

            {loading && <p className="text-center text-gray-500 mt-4">Loading…</p>}
        </main>
    );
}
