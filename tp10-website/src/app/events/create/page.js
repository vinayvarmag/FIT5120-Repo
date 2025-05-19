"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function CreateEventPage() {
    const { user } = useAuth();
    const router = useRouter();

    // ─── form fields ─────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(50000);

    // ─── venue autocomplete ───────────────────────────────────────
    const [venueQuery, setVenueQuery] = useState("");
    const [venueResults, setVenueResults] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [loadingVenues, setLoadingVenues] = useState(false);

    // ─── validation & submission state ───────────────────────────
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Debounced fetch for venue predictions
    useEffect(() => {
        if (venueQuery.trim().length < 3) {
            setVenueResults([]);
            return;
        }
        const handle = setTimeout(async () => {
            setLoadingVenues(true);
            try {
                const res = await fetch(
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

    function choosePrediction(pred) {
        setSelectedVenue({
            place_id: pred.place_id,
            name: pred.structured_formatting.main_text,
            formatted_address: pred.description,
        });
        setVenueQuery("");
        setVenueResults([]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setErrors({});

        // Client-side validations
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Title is required.";
        if (!startDate) newErrors.startDate = "Start date is required.";
        if (!endDate) newErrors.endDate = "End date is required.";
        if (!startTime) newErrors.startTime = "Start time is required.";
        if (!endTime) newErrors.endTime = "End time is required.";
        if (!selectedVenue) newErrors.venue = "Please select a venue.";
        if (!description.trim()) newErrors.description = "Description is required.";
        if (budget < 0) newErrors.budget = "Budget must be zero or positive.";

        // Date-time consistency
        if (startDate && endDate && startTime && endTime) {
            const start = new Date(`${startDate}T${startTime}:00`);
            const end = new Date(`${endDate}T${endTime}:00`);
            if (start >= end) {
                newErrors.endDate = "End date/time must be after start date/time.";
            }
        }

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            setSubmitting(false);
            return;
        }

        // Submit to server
        const payload = {
            event_title: title,
            venue_place_id: selectedVenue.place_id,
            venue_name: selectedVenue.name,
            venue_address: selectedVenue.formatted_address,
            event_description: description,
            event_startdatetime: `${startDate} ${startTime}:00`,
            event_enddatetime: `${endDate} ${endTime}:00`,
            event_budget: budget,
        };

        try {
            const res = await fetch("/api/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to create event");
            const created = await res.json();
            router.push(`/events/${created.event_id}/edit`);
        } catch (err) {
            console.error(err);
            setErrors({ submit: "An error occurred. Please try again." });
            setSubmitting(false);
        }
    }

    const todayISO = new Date().toISOString().split("T")[0];

    // ─── require login ─────────────────────────────────────────
    if (user === undefined) {
        return (
            <main className="min-h-screen bg-gray-50 text-black pt-24 flex items-center justify-center">
                <p>Loading…</p>
            </main>
        );
    }
    if (!user) {
        return (
            <main className="min-h-screen bg-gray-50 text-black pt-24 flex items-center justify-center">
                <p>
                    Please <Link href="/login" className="underline">log in</Link> to create an event.
                </p>
            </main>
        );
    }

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
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
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
                            className="w-full border rounded-lg px-4 py-2"
                        />
                        {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            min={startDate || todayISO}
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                        {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                    </div>
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
                        <input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                        {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                    </div>
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
                        <input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                        {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                    </div>
                </div>

                {/* Venue Autocomplete */}
                <div className="relative">
                    <label htmlFor="venue" className="block text-sm font-medium mb-1">Venue</label>
                    <input
                        id="venue"
                        type="text"
                        value={venueQuery || selectedVenue?.name || ""}
                        onChange={e => { setVenueQuery(e.target.value); setSelectedVenue(null); }}
                        placeholder="Search venue by name"
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
                    {selectedVenue && (
                        <button type="button" className="absolute top-8 right-3" onClick={() => { setSelectedVenue(null); setVenueQuery(""); }}>
                            <FaTimes />
                        </button>
                    )}
                    {loadingVenues && <p className="text-sm text-gray-500 mt-1">Loading…</p>}
                    {venueResults.length > 0 && !selectedVenue && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg max-h-48 overflow-y-auto shadow-lg">
                            {venueResults.map(p => (
                                <div key={p.place_id} onClick={() => choosePrediction(p)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                                    {p.structured_formatting.main_text}
                                    <span className="block text-xs text-gray-500">{p.structured_formatting.secondary_text}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedVenue && (
                        <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium text-gray-800">Selected: {selectedVenue.name}</p>
                            <p className="text-xs text-gray-500">{selectedVenue.formatted_address}</p>
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
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
                </div>

                {/* Submit */}
                <div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full flex items-center justify-center bg-purple-900 text-white py-3 rounded-lg space-x-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                        <span>{submitting ? 'Creating...' : 'Create Event'}</span>
                    </button>
                    {errors.submit && <p className="text-red-500 text-center text-sm mt-2">{errors.submit}</p>}
                </div>
            </form>
        </main>
    );
}
