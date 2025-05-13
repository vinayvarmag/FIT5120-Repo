"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";

export default function CreateEventPage() {
    const router = useRouter();

    /* ─── form state ─── */
    const [title,       setTitle]       = useState("");
    const [date,        setDate]        = useState("");
    const [start,       setStart]       = useState("");
    const [end,         setEnd]         = useState("");
    const [venue,       setVenue]       = useState("");
    const [description, setDescription] = useState("");
    const [budget,      setBudget]      = useState(50000);

    const todayISO = new Date().toISOString().split("T")[0];

    /* ─── submit ─── */
    async function handleSubmit(e) {
        e.preventDefault();

        const body = {
            event_title:        title,
            event_venue:        venue,
            event_description:  description,
            event_startdatetime:`${date} ${start}:00`,
            event_enddatetime:  `${date} ${end}:00`,
            event_budget:       budget,
        };

        const res = await fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error("Failed to create event");
            return;
        }

        const created = await res.json();
        // assumes API returns { id: ... }
        router.push(`/events/edit/${created.id}`);
    }

    /* ─── render ─── */
    return (
        <main className="max-w-2xl mx-auto px-4 pt-24">
            <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">

                {/* Event Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Event Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Enter event title"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 placeholder-gray-400"
                    />
                </div>

                {/* Date / Start / End */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-1">
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            min={todayISO}
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="start" className="block text-sm font-medium mb-1">
                            Start Time
                        </label>
                        <input
                            id="start"
                            type="time"
                            value={start}
                            onChange={e => setStart(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="end" className="block text-sm font-medium mb-1">
                            End Time
                        </label>
                        <input
                            id="end"
                            type="time"
                            value={end}
                            onChange={e => setEnd(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        />
                    </div>
                </div>

                {/* Venue */}
                <div>
                    <label htmlFor="venue" className="block text-sm font-medium mb-1">
                        Venue
                    </label>
                    <input
                        id="venue"
                        type="text"
                        value={venue}
                        onChange={e => setVenue(e.target.value)}
                        placeholder="Search venue by name"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 placeholder-gray-400"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Enter event description"
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 placeholder-gray-400"
                    />
                </div>

                {/* Total Budget */}
                <div>
                    <label htmlFor="budget" className="block text-sm font-medium mb-1">
                        Total Budget
                    </label>
                    <input
                        id="budget"
                        type="number"
                        value={budget}
                        onChange={e => setBudget(Number(e.target.value))}
                        min={0}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                </div>

                {/* Submit Button */}
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
