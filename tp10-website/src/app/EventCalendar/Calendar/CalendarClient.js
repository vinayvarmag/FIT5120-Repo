"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from "react-big-calendar";
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

const locales = { "en-AU": enAU };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarClient({ userId }) {
    const router = useRouter();
    const isAuthenticated = Boolean(userId);
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    // ── Data ───────────────────────────────────────────────────────
    const [allEvents, setAllEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);

    // ── UI state ───────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState("all"); // "all" | "mine" | "locked"
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loginPrompt, setLoginPrompt] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // ── Load ALL events once ───────────────────────────────────────
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/event/all");
                const raw = await res.json();
                setAllEvents(
                    raw.map((ev) => ({
                        id: ev.event_id,
                        title: ev.event_title,
                        start: new Date(ev.event_startdatetime),
                        end: new Date(ev.event_enddatetime || ev.event_startdatetime),
                        resource: { ...ev, calendarType: "all" },
                    }))
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ── Load MY events when requested ──────────────────────────────
    useEffect(() => {
        if (viewMode === "mine" && isAuthenticated) {
            (async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/event");
                    const raw = await res.json();
                    setUserEvents(
                        raw.map((ev) => ({
                            id: ev.event_id,
                            title: ev.event_title,
                            start: new Date(ev.event_startdatetime),
                            end: new Date(ev.event_enddatetime || ev.event_startdatetime),
                            resource: { ...ev, calendarType: "mine" },
                        }))
                    );
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [viewMode, isAuthenticated]);

    // ── Custom toolbar ────────────────────────────────────────────
    function CalendarToolbar({ label, onNavigate, onView, view, views }) {
        return (
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <button onClick={() => onNavigate("PREV")} className="p-2 rounded-full hover:bg-gray-200">
                        <RiArrowLeftLine size={20} />
                    </button>
                    <span className="font-semibold text-lg select-none">{label}</span>
                    <button onClick={() => onNavigate("NEXT")} className="p-2 rounded-full hover:bg-gray-200">
                        <RiArrowRightLine size={20} />
                    </button>
                </div>
                <div className="flex space-x-1">
                    {views.map((v) => (
                        <button
                            key={v}
                            onClick={() => onView(v)}
                            className={`px-3 py-1 rounded-md text-sm capitalize ${
                                view === v
                                    ? "bg-purple-900 text-white"
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

    // ── View toggle handlers ──────────────────────────────────────
    const handleViewAll = () => setViewMode("all");
    const handleViewMine = () => {
        if (isAuthenticated) setViewMode("mine");
        else setViewMode("locked");
    };

    // ── When an event is clicked ───────────────────────────────────
    const handleSelectEvent = useCallback(
        (ev) => {
            if (!isAuthenticated) {
                setLoginPrompt(true);
                return;
            }
            setSelected(ev.resource);
            setSaved(false);
        },
        [isAuthenticated]
    );

    // ── Save / Unsave an event ────────────────────────────────────
    const toggleSave = useCallback(async () => {
        if (!selected || saving) return;
        setSaving(true);
        try {
            if (saved) {
                await fetch(`/api/user-event?event_id=${selected.event_id}`, { method: "DELETE" });
                setSaved(false);
            } else {
                await fetch("/api/user-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_id: selected.event_id,
                        event_name: selected.event_title,
                        event_url: selected.event_url,
                        thumbnail_url: selected.thumbnail_url,
                        datetime_start: selected.event_startdatetime,
                        datetime_end: selected.event_enddatetime,
                    }),
                });
                setSaved(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }, [selected, saved, saving]);

    // ── Style each event by its calendarType ─────────────────────
    const eventPropGetter = (event) => {
        const bg = event.resource.calendarType === "mine" ? "#DDC5E3" : "#DDC5E3";
        return {
            style: {
                backgroundColor: bg,
                color: "#000000",
                borderRadius: "4px",
                border: "none",
            },
        };
    };

    return (
        <main className="min-h-screen p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Event Calendar</h1>

            {/* View toggles */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    onClick={handleViewAll}
                    className={`px-4 py-2 rounded-lg ${
                        viewMode === "all" ? "bg-purple-900 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                    All Events
                </button>
                <button
                    onClick={handleViewMine}
                    className={`px-4 py-2 rounded-lg ${
                        viewMode === "mine" ? "bg-purple-900 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                    My Events
                </button>
            </div>

            {/* Locked view */}
            {viewMode === "locked" && !isAuthenticated ? (
                <div className="text-center p-6">
                    <p className="text-lg">
                        You must{" "}
                        <a href="/login" className="underline text-purple-700">
                            log in
                        </a>{" "}
                        to see your events.
                    </p>
                </div>
            ) : (
                <BigCalendar
                    localizer={localizer}
                    events={viewMode === "all" ? allEvents : userEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.MONTH}
                    views={["month", "week", "day", "agenda"]}
                    style={{ height: "80vh" }}
                    onSelectEvent={handleSelectEvent}
                    components={{ toolbar: CalendarToolbar }}
                    eventPropGetter={eventPropGetter}
                />
            )}

            {/* Event Details Modal */}
            {selected && (
                <Modal isOpen onClose={() => setSelected(null)} title={selected.event_title}>
                    <div className="space-y-2 text-black">
                        <p className="font-semibold">
                            {new Date(selected.event_startdatetime).toLocaleString()} –{" "}
                            {new Date(selected.event_enddatetime ?? selected.event_startdatetime).toLocaleString()}
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
                                            const url = new URL("https://www.google.com/maps/embed/v1/place");
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
                            className="flex items-center gap-2 bg-purple-900 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg"
                        >
                            {saved ? <RiBookmarkFill /> : <RiBookmarkLine />}
                            {saved ? "Un-save event" : "Save event"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* Login Prompt Modal */}
            {loginPrompt && (
                <Modal isOpen onClose={() => setLoginPrompt(false)} title="Login Required">
                    <div className="space-y-4 text-black text-center">
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
