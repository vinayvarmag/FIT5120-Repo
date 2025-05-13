/* File: src/app/events/[id]/rsvp/page.js */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, notFound } from "next/navigation";

/* ────────────────────────────────────────────────────────────
   RSVP PAGE
────────────────────────────────────────────────────────────── */
export default function RsvpPage({ params }) {
    const { id: eventId } = params;                 // /events/[id]/rsvp
    const query      = useSearchParams();
    const router     = useRouter();

    /* ─── state ─── */
    const [event,         setEvent]         = useState(null);   // event record
    const [participants,  setParticipants]  = useState([]);     // list for selector
    const [chosenId,      setChosenId]      = useState(query.get("participant") ?? "");
    const [chosenName,    setChosenName]    = useState("");
    const [status,        setStatus]        = useState("Accepted");
    const [loadingEvt,    setLoadingEvt]    = useState(true);
    const [loadingParts,  setLoadingParts]  = useState(false);

    /* ─── fetch event once ─── */
    useEffect(() => {
        fetch(`/api/event/${eventId}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { setEvent(data); setLoadingEvt(false); })
            .catch(() => notFound());
    }, [eventId]);

    /* ─── if no participant yet → load list ─── */
    useEffect(() => {
        if (chosenId) return;                    // no need
        setLoadingParts(true);
        fetch(`/api/event_participant?event_id=${eventId}`)
            .then(r => r.json())
            .then(list => { setParticipants(list); setLoadingParts(false); });
    }, [eventId, chosenId]);

    /* ─── when we *do* have a participant id → grab their name (cheap) ─── */
    useEffect(() => {
        if (!chosenId) return;
        fetch(`/api/event_participant?event_id=${eventId}`)
            .then(r => r.json())
            .then(list => {
                const p = list.find(x => String(x.participant_id) === String(chosenId));
                if (p) setChosenName(p.participant_fullname);
            });
    }, [eventId, chosenId]);

    /* ─── handlers ─── */
    async function submitRsvp() {
        await fetch("/api/participant_rsvp", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event_id:       eventId,
                participant_id: chosenId,
                rsvp_status:    status,
            }),
        });
        alert("Thanks! Your response has been recorded.");
        router.push("/events");                  // back to events home (or wherever you like)
    }

    function handleParticipantSelect(e) {
        const pid = e.target.value;
        setChosenId(pid);

        /* update the URL so a refresh keeps the same person */
        const url = new URL(location.href);
        url.searchParams.set("participant", pid);
        router.replace(url.pathname + url.search);
    }

    /* ─── UI blocks ─── */
    if (loadingEvt) return <p className="pt-24 px-4">Loading…</p>;
    if (!chosenId) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
                <div className="bg-white p-8 rounded shadow w-full max-w-md">
                    <h1 className="text-xl font-bold mb-4">{event.event_title}</h1>
                    <p className="mb-4">Please select your name to RSVP:</p>

                    {loadingParts ? (
                        <p>Loading participants…</p>
                    ) : participants.length === 0 ? (
                        <p>No participants have been linked to this event.</p>
                    ) : (
                        <>
                            <select
                                className="w-full border rounded px-3 py-2 mb-4"
                                defaultValue=""
                                onChange={handleParticipantSelect}
                            >
                                <option value="" disabled>
                                    Select your name…
                                </option>
                                {participants.map(p => (
                                    <option key={p.participant_id} value={p.participant_id}>
                                        {p.participant_fullname}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500">
                                Can’t see your name? Ask the organiser to add you first.
                            </p>
                        </>
                    )}
                </div>
            </main>
        );
    }

    /* ─── RSVP form ─── */
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded shadow w-full max-w-md">
                <h1 className="text-2xl font-bold mb-2">{event.event_title}</h1>
                <p className="text-sm text-gray-600 mb-6">
                    Hi <span className="font-medium">{chosenName || "there"}</span> – will you be attending?
                </p>

                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-6"
                >
                    <option value="Accepted">Accept</option>
                    <option value="Rejected">Decline</option>
                    <option value="Pending">Maybe later</option>
                </select>

                <button
                    onClick={submitRsvp}
                    className="w-full bg-purple-900 text-white py-2 rounded hover:bg-purple-800"
                >
                    Submit RSVP
                </button>
            </div>
        </main>
    );
}
