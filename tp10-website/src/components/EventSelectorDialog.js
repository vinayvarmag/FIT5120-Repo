"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";

export default function EventSelectorDialog({ isOpen, onClose }) {
    const router = useRouter();

    /* ─── state ─── */
    const [events,       setEvents]       = useState([]);
    const [search,       setSearch]       = useState("");
    const [isLoading,    setLoading]      = useState(false);

    /* ─── load events once ─── */
    useEffect(() => {
        if (!isOpen) return;                          // don’t fetch in background
        setLoading(true);
        fetch("/api/event")                           // GET → every event row
            .then(r => r.json())
            .then(setEvents)
            .finally(() => setLoading(false));
    }, [isOpen]);

    /* ─── helpers ─── */
    const filtered = events.filter(e =>
        e.event_title.toLowerCase().includes(search.toLowerCase())
    );

    function handleSelect(id) {
        onClose();                                    // hide modal first
        router.push(`/events/${id}/edit`);            // then navigate
    }

    /* ─── render ─── */
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Event">
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title…"
                className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            {isLoading ? (
                <p className="text-sm px-2">Loading…</p>
            ) : filtered.length === 0 ? (
                <p className="text-sm px-2">No matching events.</p>
            ) : (
                <div className="max-h-60 overflow-y-auto divide-y">
                    {filtered.map(ev => (
                        <button
                            key={ev.event_id}
                            onClick={() => handleSelect(ev.event_id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                            <p className="font-medium">{ev.event_title}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(ev.event_startdatetime).toLocaleDateString()} &nbsp;•&nbsp;
                                {ev.venue_name ?? "No venue"}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </Modal>
    );
}
