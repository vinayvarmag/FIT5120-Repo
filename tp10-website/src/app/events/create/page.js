// File: src/app/events/create/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function CreateEventPage() {
    const router = useRouter();

    // ─── form fields ─────────────────────────────────────────
    const [title, setTitle]             = useState("");
    const [startDate, setStartDate]     = useState("");
    const [endDate, setEndDate]         = useState("");
    const [startTime, setStartTime]     = useState("");
    const [endTime, setEndTime]         = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget]           = useState(50000);

    // ─── venue autocomplete ──────────────────────────────────
    const [venueQuery, setVenueQuery]       = useState("");
    const [venueResults, setVenueResults]   = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [loadingVenues, setLoadingVenues] = useState(false);

    // debounce + fetch predictions
    useEffect(() => {
        if (venueQuery.trim().length < 3) {
            setVenueResults([]);
            return;
        }
        const handle = setTimeout(async () => {
            setLoadingVenues(true);
            try {
                const res  = await fetch(
                    `/api/venue?search=${encodeURIComponent(venueQuery)}`
                );
                const json = await res.json();
                setVenueResults(Array.isArray(json) ? json : []);
            } catch (err) {
                console.error("Venue fetch error", err);
                setVenueResults([]);
            } finally {
                setLoadingVenues(false);
            }
        }, 300);
        return () => clearTimeout(handle);
    }, [venueQuery]);

    // choose one prediction
    function choosePrediction(pred) {
        setSelectedVenue({
            place_id:          pred.place_id,
            name:              pred.structured_formatting.main_text,
            formatted_address: pred.description,
        });
        setVenueQuery("");
        setVenueResults([]);
    }

    // ─── submit form ─────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedVenue) {
            return alert("Please select a venue from the list.");
        }
        if (!startDate || !endDate || !startTime || !endTime) {
            return alert("Please fill in both start and end date/time.");
        }

        const body = {
            event_title:        title,
            venue_place_id:     selectedVenue.place_id,
            venue_name:         selectedVenue.name,
            venue_address:      selectedVenue.formatted_address,
            event_description:  description,
            event_startdatetime:`${startDate} ${startTime}:00`,
            event_enddatetime:  `${endDate} ${endTime}:00`,
            event_budget:       budget,
        };

        const res = await fetch("/api/event", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("Failed to create event");
            return;
        }
        const created = await res.json();
        router.push(`/events/${created.event_id}/edit`);
    }

    const todayISO = new Date().toISOString().split("T")[0];

    return (
        <main className="max-w-2xl mx-auto px-4 pt-24 text-black">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">Event Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Enter event title"
                        required
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Dates & Times */}
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            id="startDate"
                            type="date"
                            min={todayISO}
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            min={startDate || todayISO}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
                        <input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
                        <input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            required
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                </div>

                {/* Venue Autocomplete */}
                <div className="relative">
                    <label htmlFor="venue" className="block text-sm font-medium mb-1">Venue</label>
                    <input
                        id="venue"
                        type="text"
                        value={venueQuery.length > 0
                            ? venueQuery
                            : (selectedVenue?.name || "")
                        }
                        onChange={e => {
                            setVenueQuery(e.target.value);
                            setSelectedVenue(null);
                        }}
                        placeholder="Search venue by name"
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />

                    {/* clear icon */}
                    {selectedVenue && (
                        <button
                            type="button"
                            className="absolute top-8 right-3"
                            onClick={() => {
                                setSelectedVenue(null);
                                setVenueQuery("");
                            }}
                        >
                            <FaTimes />
                        </button>
                    )}

                    {/* loading indicator */}
                    {loadingVenues && (
                        <p className="text-sm text-gray-500 mt-1">Loading…</p>
                    )}

                    {/* dropdown */}
                    {Array.isArray(venueResults) && venueResults.length > 0 && !selectedVenue && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {venueResults.map(p => (
                                <div
                                    key={p.place_id}
                                    onClick={() => choosePrediction(p)}
                                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                    {p.structured_formatting.main_text}
                                    <span className="block text-xs text-gray-500">
                                        {p.structured_formatting.secondary_text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* selected info */}
                    {selectedVenue && (
                        <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-800">
                                Selected: {selectedVenue.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {selectedVenue.formatted_address}
                            </p>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Budget */}
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium mb-1">Total Budget</label>
                    <input
                        id="budget"
                        type="number"
                        min={0}
                        value={budget}
                        onChange={e => setBudget(Number(e.target.value))}
                        required
                        className="w-full border rounded-lg px-4 py-2"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-purple-900 text-white py-3 rounded-lg space-x-2"
                >
                    <FaPlus />
                    <span>Create Event</span>
                </button>
            </form>
        </main>
    );
}
