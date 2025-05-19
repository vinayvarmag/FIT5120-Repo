// File: src/app/events/[id]/edit/page.js
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import Modal     from "@/components/Modal";
import jsPDF     from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs     from "dayjs";
import "remixicon/fonts/remixicon.css";

export default function EditEventPage({ params }) {
    const router       = useRouter();
    const { id }       = params;

    /* ─────────────── EVENT FORM STATE ─────────────── */
    const [event,           setEvent]           = useState(null);
    const [eventTitle,      setEventTitle]      = useState("");
    const [eventDateInput,  setEventDateInput]  = useState("");
    const [eventStartTime,  setEventStartTime]  = useState("");
    const [eventEndDate,    setEventEndDate]    = useState("");
    const [eventEndTime,    setEventEndTime]    = useState("");

    /* ─────────────── VENUE AUTOCOMPLETE ───────────── */
    const [selectedVenue,      setSelectedVenue]   = useState(null);
    const [venueSearchQuery,   setVenueSearchQuery] = useState("");
    const [venueResults,       setVenueResults]     = useState([]);
    const [loading,            setLoading]          = useState(false);

    /* ───────────── OTHER FORM STATE ──────────────── */
    const [eventDescription, setEventDescription] = useState("");
    const [eventBudget,      setEventBudget]      = useState(50000);
    const [currentExpenses,  setCurrentExpenses]  = useState(0);

    /* participants, agenda, logistics state … unchanged */
    /* (all the big blocks below are identical to your original file) */
    const [participants,           setParticipants]           = useState([]);
    const [participantSearch,      setParticipantSearch]      = useState("");
    const [eventParticipants,      setEventParticipants]      = useState([]);
    const [isParticipantModalOpen, setParticipantModalOpen]   = useState(false);
    const [editingParticipant,     setEditingParticipant]     = useState(null);
    const [participantForm,        setParticipantForm]        = useState({
        participant_fullname: "", participant_description: "",
        ethnicity_id: "", category_id: ""
    });
    const [ethnicities,            setEthnicities]            = useState([]);
    const [participantCategories,  setParticipantCategories]  = useState([]);

    const [agendaItems,        setAgendaItems]        = useState([]);
    const [isAgendaModalOpen,  setAgendaModalOpen]    = useState(false);
    const [editingAgendaItem,  setEditingAgendaItem]  = useState(null);
    const [agendaForm,         setAgendaForm]         = useState({
        agenda_timeframe: "", agenda_title: "",
        agenda_description: "", agenda_status: "Pending"
    });

    const [logisticTasks,          setLogisticTasks]          = useState([]);
    const [isLogisticModalOpen,    setLogisticModalOpen]      = useState(false);
    const [editingLogisticTask,    setEditingLogisticTask]    = useState(null);
    const [newLogisticTask,        setNewLogisticTask]        = useState({
        logistic_title: "", logistic_description: "", logistic_status: "Pending"
    });
    const [isLogisticStatusOpen,   setLogisticStatusModalOpen] = useState(false);
    const [selectedLogisticTaskForStatus, setSelectedLogisticTaskForStatus] = useState(null);

    const printRef = useRef(null);
    const [errors,           setErrors]           = useState({});

    /* ─── INITIAL LOAD ─── */
    useEffect(() => {
        async function loadEverything() {
            const ev = await fetch(`/api/event/${id}`).then(r => r.ok ? r.json() : null);
            if (!ev) { router.push("/events"); return; }

            setEvent(ev);
            setEventTitle(ev.event_title || "");
            if (ev.event_startdatetime) {
                const d = new Date(ev.event_startdatetime);
                setEventDateInput(d.toISOString().split("T")[0]);
                setEventStartTime(d.toISOString().split("T")[1].slice(0,5));
            }
            if (ev.event_enddatetime) {
                const d = new Date(ev.event_enddatetime);
                setEventEndTime(d.toISOString().split("T")[1].slice(0,5));
            }
            if (ev.venue_place_id) {
                setSelectedVenue({
                    place_id:          ev.venue_place_id,
                    name:              ev.venue_name,
                    formatted_address: ev.venue_address,
                });
            }
            if (ev.event_enddatetime) {
                const dEnd = new Date(ev.event_enddatetime);
                setEventEndDate(dEnd.toISOString().split("T")[0]);
                setEventEndTime(dEnd.toISOString().split("T")[1].slice(0,5));
            }
            setEventDescription(ev.event_description || "");
            setEventBudget(ev.event_budget ?? 50000);
            setCurrentExpenses(ev.current_expenses ?? 0);

            const [parts, agendas, logs] = await Promise.all([
                fetch(`/api/event_participant?event_id=${id}`).then(r => r.json()),
                fetch(`/api/agenda?event_id=${id}`).then(r => r.json()),
                fetch(`/api/logistics?event_id=${id}`).then(r => r.json()),
            ]);
            setEventParticipants(parts);
            setAgendaItems(agendas);
            setLogisticTasks(logs);
        }
        loadEverything();
    }, [id, router]);

    /* ─── COMMON HELPERS ─── */
    const reloadParticipants = async () => {
        const data = await fetch(`/api/participant`).then(r => r.json());
        setParticipants(data);
    };
    const reloadVenueResults = async (q) => {
        if (q.trim().length <= 2) { setVenueResults([]); return; }
        setLoading(true);
        const data = await fetch(`/api/venue?search=${encodeURIComponent(q)}`).then(r => r.json());
        setVenueResults(data);
        setLoading(false);
    };
    useEffect(() => {                      // debounce user typing
        const t = setTimeout(() => reloadVenueResults(venueSearchQuery), 300);
        return () => clearTimeout(t);
    }, [venueSearchQuery]);

    /** User picks one prediction from the dropdown. */
    function choosePrediction(pred) {
        setSelectedVenue({
            place_id:          pred.place_id,
            name:              pred.structured_formatting.main_text,
            formatted_address: pred.description,     // full line
        });
        setVenueSearchQuery("");
        setVenueResults([]);
    }

    useEffect(() => { reloadParticipants(); }, []);
    useEffect(() => {
        const t = setTimeout(() => reloadVenueResults(venueSearchQuery), 300);
        return () => clearTimeout(t);
    }, [venueSearchQuery]);

    /* ─── EVENT UPDATE / DELETE ─── */
    async function handleSaveEvent(e) {
        e.preventDefault();

        const newErrors = {};
        if (!eventTitle.trim()) newErrors.eventTitle = "Title is required.";
        if (!eventDateInput) newErrors.eventDateInput = "Start date is required.";
        if (!eventStartTime) newErrors.eventStartTime = "Start time is required.";
        if (!eventEndDate) newErrors.eventEndDate = "End date is required.";
        if (!eventEndTime) newErrors.eventEndTime = "End time is required.";
        if (eventDateInput && eventStartTime && eventEndDate && eventEndTime) {
            const start = new Date(`${eventDateInput}T${eventStartTime}`);
            const end   = new Date(`${eventEndDate}T${eventEndTime}`);
            if (end <= start) newErrors.eventEndTime = "End date/time must be after start date/time.";
        }
        if (!selectedVenue) newErrors.venue = "Venue selection is required.";
        if (!eventDescription.trim()) newErrors.eventDescription = "Description is required.";
        else if (eventDescription.trim().length < 10) newErrors.eventDescription = "Description must be at least 10 characters.";
        if (eventBudget < 0) newErrors.eventBudget = "Budget cannot be negative.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        const body = {
            event_title:       eventTitle,
            event_description: eventDescription,
            event_startdatetime: eventDateInput && eventStartTime
                ? `${eventDateInput} ${eventStartTime}:00` : null,
            event_enddatetime:   eventEndDate && eventEndTime
                ? `${eventEndDate} ${eventEndTime}:00`   : null,
            event_budget:      eventBudget,
        };
        if (selectedVenue) {
            body.venue_place_id = selectedVenue.place_id;
            body.venue_name     = selectedVenue.name;
            body.venue_address  = selectedVenue.formatted_address;
        }
        await fetch(`/api/event/${id}`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
        });
        router.refresh();
    }
    async function handleDeleteEvent() {
        if (!confirm("Really delete this event?")) return;
        await fetch(`/api/event/${id}`, { method: "DELETE" });
        router.push("/events");
    }

    /* ─── PARTICIPANT HANDLERS ─── */
    async function linkParticipant(pid) {
        await fetch("/api/event_participant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: id, participant_id: pid, rsvp_status: "Pending" }),
        });
        const data = await fetch(`/api/event_participant?event_id=${id}`).then(r => r.json());
        setEventParticipants(data);
    }
    async function unlinkParticipant(pid) {
        if (!confirm("Remove this participant?")) return;
        await fetch("/api/event_participant", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: id, participant_id: pid }),
        });
        setEventParticipants(prev => prev.filter(p => p.participant_id !== pid));
    }
    async function changeRsvp(pid, status) {
        await fetch("/api/participant_rsvp", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_id: id, participant_id: pid, rsvp_status: status }),
        });
        setEventParticipants(prev =>
            prev.map(p => p.participant_id === pid ? { ...p, rsvp_status: status } : p)
        );
    }

    /* ─── AGENDA HANDLERS ─── */
    async function saveAgenda(e) {
        e.preventDefault();
        const payload = { ...agendaForm, event_id: id };
        const url = editingAgendaItem ? `/api/agenda/${editingAgendaItem.agenda_id}` : "/api/agenda";
        const method = editingAgendaItem ? "PUT" : "POST";
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await fetch(`/api/agenda?event_id=${id}`).then(r => r.json());
        setAgendaItems(data);
        setEditingAgendaItem(null);
        setAgendaForm({ agenda_timeframe: "", agenda_title: "", agenda_description: "", agenda_status: "Pending" });
        setAgendaModalOpen(false);
    }
    async function deleteAgenda(agendaId) {
        if (!confirm("Delete agenda item?")) return;
        await fetch(`/api/agenda?agenda_id=${agendaId}`, { method: "DELETE" });
        setAgendaItems(prev => prev.filter(a => a.agenda_id !== agendaId));
    }



    /* ─── LOGISTICS HANDLERS ─── */
    async function saveLogistic(e) {
        e.preventDefault();
        const payload = { ...newLogisticTask, event_id: id };
        const url = editingLogisticTask ? `/api/logistics/${editingLogisticTask.logistic_id}` : "/api/logistics";
        const method = editingLogisticTask ? "PUT" : "POST";
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await fetch(`/api/logistics?event_id=${id}`).then(r => r.json());
        setLogisticTasks(data);
        setEditingLogisticTask(null);
        setNewLogisticTask({ logistic_title: "", logistic_description: "", logistic_status: "Pending" });
        setLogisticModalOpen(false);
    }
    async function deleteLogistic(lid) {
        if (!confirm("Delete logistic task?")) return;
        await fetch(`/api/logistics?logistic_id=${lid}`, { method: "DELETE" });
        setLogisticTasks(prev => prev.filter(l => l.logistic_id !== lid));
    }
    async function updateLogisticStatus(lid, status) {
        await fetch(`/api/logistics/${lid}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logistic_status: status }),
        });
        setLogisticTasks(prev =>
            prev.map(l => l.logistic_id === lid ? { ...l, logistic_status: status } : l)
        );
    }

    function exportStructuredPDF() {
        if (!event) return;

        const doc = new jsPDF({ unit: "mm", format: "a4" });
        let cursorY = 20;

        // —— 1.  TITLE
        doc.setFontSize(18)
            .text(eventTitle || "Untitled Event", 105, cursorY, { align: "center" });
        cursorY += 10;

        // — 2. DATE —
        const formattedDate = dayjs(eventDateInput).format("DD MMM YYYY");
        doc.setFontSize(12)
            .text(`Date: ${formattedDate}`, 14, cursorY);
        cursorY += 6;

        // — 3. TIME —
        doc.text(
            `Time: ${eventStartTime} – ${eventEndTime}`,
            14,
            cursorY
        );
        cursorY += 6;

        // — 4. VENUE —
        const venueName = selectedVenue?.venue_name || "Not specified";
        doc.text(`Venue: ${venueName}`, 14, cursorY);
        cursorY += 6;

        // — 5. DESCRIPTION —
        if (eventDescription) {
            doc.setFontSize(12)
                .text("Description:", 14, cursorY);

            // move down one line before printing the wrapped text:
            cursorY += 6;

            // wrap at 180 mm page-width (you can tweak this)
            const wrapped = doc.splitTextToSize(eventDescription, 180);

            // print each wrapped line, advancing Y by ~6 mm each
            wrapped.forEach(line => {
                doc.text(line, 14, cursorY);
                cursorY += 6;

                // if we hit the bottom, go to a new page
                if (cursorY > 270) {
                    doc.addPage();
                    cursorY = 20;
                }
            });

            // add a bit of breathing room before the next section
            cursorY += 4;
        } else {
            cursorY += 4;
        }

        // — 6. TOTAL BUDGET —
        const budgetValue = typeof eventBudget === "number"
            ? eventBudget
            : parseFloat(eventBudget) || 0;

        doc.text(
            `Total Budget: $${budgetValue.toFixed(2)}`,
            14,
            cursorY
        );
        cursorY += 8;

        // helper – makes tables and pushes Y down
        const makeTable = (title, head, rows) => {
            doc.setFontSize(13);
            doc.text(title, 14, cursorY);
            cursorY += 3;
            const bodyRows = rows.length ? rows : [Array(head.length).fill(" ")];
            autoTable(doc, {
                head: [head],
                body: bodyRows,
                startY: cursorY,
                margin: { left: 14, right: 14 },
                styles: { fontSize: 10 },
            });
            cursorY = doc.lastAutoTable.finalY + 8;
            if (cursorY > 270) {
                doc.addPage();
                cursorY = 20;
            }
        };

        // —— 3.  PARTICIPANTS
        makeTable(
            "Participants",
            ["Name", "Role / Description"],
            eventParticipants.map(p => [p.participant_fullname, p.participant_description ?? ""])
        );

        // —— 4.  AGENDA
        makeTable(
            "Agenda",
            ["Timeframe", "Activity", "Notes", "Status"],
            agendaItems.map(a => [
                a.agenda_timeframe || "",
                a.agenda_title     || "",
                a.agenda_description || "",
                a.agenda_status    || ""
            ])
        );

        // —— 5.  LOGISTICS
        makeTable(
            "Logistics",
            ["Item", "Details"],
            logisticTasks.map(l => [l.item, l.details])
        );

        doc.save(`event-${id}.pdf`);
    }
    /* ─── RENDER ─── */
    if (!event) return <p className="pt-24 px-4">Loading…</p>;

    return (
        <Suspense fallback={<p className="pt-24 px-4">Loading…</p>}>
            <div className="bg-gray-50 min-h-screen text-black">
                <main className="relative max-w-3xl mx-auto px-4 pt-24 pb-8 space-y-8">

                    {/* HEADER */}
                    <header className="text-center">
                        <h1 className="text-2xl font-bold">Edit Event – {eventTitle}</h1>
                    </header>

                    {/* EVENT DETAILS */}
                    <section className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    value={eventTitle}
                                    onChange={e => setEventTitle(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                {errors.eventTitle && <p className="text-red-500 text-sm mt-1">{errors.eventTitle}</p>}
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={eventDateInput}
                                        onChange={e => setEventDateInput(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                    {errors.eventDateInput && <p className="text-red-500 text-sm mt-1">{errors.eventDateInput}</p>}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={eventEndDate}
                                        onChange={e => setEventEndDate(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                    {errors.eventEndDate && <p className="text-red-500 text-sm mt-1">{errors.eventEndDate}</p>}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={eventStartTime}
                                        onChange={e => setEventStartTime(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                    {errors.eventStartTime && <p className="text-red-500 text-sm mt-1">{errors.eventStartTime}</p>}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={eventEndTime}
                                        onChange={e => setEventEndTime(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                    {errors.eventEndTime && <p className="text-red-500 text-sm mt-1">{errors.eventEndTime}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Venue</label>
                                <input
                                    type="text"
                                    value={venueSearchQuery.length > 0 ? venueSearchQuery : (selectedVenue?.name || "")}
                                    onChange={e => { setVenueSearchQuery(e.target.value); setSelectedVenue(null); }}
                                    placeholder="Search venue by name"
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                {errors.venue && <p className="text-red-500 text-sm mt-1">{errors.venue}</p>}
                                {/* venue autocomplete list unchanged ... */}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={eventDescription}
                                    onChange={e => setEventDescription(e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2 h-24"
                                />
                                {errors.eventDescription && <p className="text-red-500 text-sm mt-1">{errors.eventDescription}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Budget</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={eventBudget}
                                    onChange={e => setEventBudget(Number(e.target.value))}
                                    className="w-full border rounded-lg px-4 py-2"
                                />
                                {errors.eventBudget && <p className="text-red-500 text-sm mt-1">{errors.eventBudget}</p>}
                            </div>
                            <div className="flex space-x-2">
                                <button type="submit" className="flex-1 bg-purple-900 text-white rounded-lg px-4 py-2">
                                    Save Changes
                                </button>
                                <button type="button" onClick={handleDeleteEvent} className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2">
                                    Delete Event
                                </button>
                                <button
                                    onClick={exportStructuredPDF}
                                    className="bg-purple-900 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* PARTICIPANTS */}
                    <section className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Linked Participants</h2>
                            <button
                                onClick={() => setParticipantModalOpen(true)}
                                className="bg-purple-900 text-white px-3 py-1.5 rounded-lg"
                            >
                                Select Participant
                            </button>
                        </div>
                        {eventParticipants.length === 0 ? (
                            <p className="text-sm">No participants linked.</p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                                <table className="table-fixed w-full divide-y divide-gray-200 text-sm">
                                    <thead>
                                    <tr>
                                        {["Full Name", "Description", "Category", "Ethnicity", "RSVP", "Actions"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left font-medium uppercase text-xs">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {eventParticipants.map(p => (
                                        <tr key={p.participant_id} className="divide-x divide-gray-200">
                                            <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                {p.participant_fullname}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                {p.participant_description}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                                {p.category_name || "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                                {p.ethnicity_name || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={p.rsvp_status || "Pending"}
                                                    onChange={e => changeRsvp(p.participant_id, e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                >
                                                    <option>Pending</option>
                                                    <option>Accepted</option>
                                                    <option>Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => unlinkParticipant(p.participant_id)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* AGENDA */}
                    <section className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Agenda</h2>
                            <button
                                onClick={() => { setEditingAgendaItem(null); setAgendaModalOpen(true); }}
                                className="bg-purple-900 text-white px-3 py-1.5 rounded-lg"
                            >
                                Add Item
                            </button>
                        </div>
                        {agendaItems.length === 0 ? (
                            <p className="text-sm">No agenda items.</p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto border rounded text-sm">
                                <table className="table-fixed w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Timeframe</th>
                                        <th className="px-4 py-2 text-left">Title</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {agendaItems.map(a => (
                                        <tr key={a.agenda_id} className="divide-x divide-gray-200">
                                            <td className="px-4 py-2">{a.agenda_timeframe}</td>
                                            <td className="px-4 py-2">{a.agenda_title}</td>
                                            <td className="px-4 py-2">{a.agenda_status}</td>
                                            <td className="px-4 py-2 text-right space-x-2">
                                                <button
                                                    onClick={() => { setEditingAgendaItem(a); setAgendaForm(a); setAgendaModalOpen(true); }}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteAgenda(a.agenda_id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* LOGISTICS */}
                    <section className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Logistics</h2>
                            <button
                                onClick={() => { setEditingLogisticTask(null); setLogisticModalOpen(true); }}
                                className="bg-purple-900 text-white px-3 py-1.5 rounded-lg"
                            >
                                Add Task
                            </button>
                        </div>
                        {logisticTasks.length === 0 ? (
                            <p className="text-sm">No logistics tasks.</p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto border rounded text-sm">
                                <table className="table-fixed w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Title</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {logisticTasks.map(l => (
                                        <tr key={l.logistic_id} className="divide-x divide-gray-200">
                                            <td className="px-4 py-2">{l.logistic_title}</td>
                                            <td className="px-4 py-2">{l.logistic_status}</td>
                                            <td className="px-4 py-2 text-right space-x-2">
                                                <button
                                                    onClick={() => { setEditingLogisticTask(l); setNewLogisticTask(l); setLogisticModalOpen(true); }}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteLogistic(l.logistic_id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* BUDGET SUMMARY */}
                    <section className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Budget</h2>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium">Total Budget</h3>
                                <p className="text-2xl font-bold">${eventBudget.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium">Current Expenses</h3>
                                <p className="text-2xl font-bold">${currentExpenses.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium">Remaining</h3>
                                <p className="text-2xl font-bold">
                                    ${(eventBudget - currentExpenses).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/finance?event_id=${id}`)}
                                className="w-full bg-purple-900 text-white py-2 rounded-lg"
                            >
                                Detailed Finance
                            </button>
                        </div>
                    </section>
                </main>

                {/* ─────────── MODALS ─────────── */}

                {/* Participant selector */}
                <Modal
                    isOpen={isParticipantModalOpen}
                    onClose={() => setParticipantModalOpen(false)}
                    title="Select Participant"
                >
                    <input
                        value={participantSearch}
                        onChange={e => setParticipantSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full border rounded-lg px-3 py-2 mb-3"
                    />
                    <div className="max-h-60 overflow-y-auto">
                        {participants
                            .filter(p => p.participant_fullname.toLowerCase().includes(participantSearch.toLowerCase()))
                            .map(p => (
                                <div
                                    key={p.participant_id}
                                    className="flex justify-between items-center px-2 py-1 hover:bg-gray-50"
                                >
                                    <span>{p.participant_fullname}</span>
                                    <button
                                        onClick={() => linkParticipant(p.participant_id)}
                                        className="text-purple-700 hover:underline"
                                    >
                                        Link
                                    </button>
                                </div>
                            ))}
                    </div>
                    <button
                        onClick={() => { setEditingParticipant(null); }}
                        className="mt-4 bg-purple-900 text-white px-3 py-1.5 rounded-lg w-full"
                    >
                        Create New Participant
                    </button>
                </Modal>

                {/* Agenda modal */}
                <Modal
                    isOpen={isAgendaModalOpen}
                    onClose={() => setAgendaModalOpen(false)}
                    title={editingAgendaItem ? "Edit Agenda Item" : "Add Agenda Item"}
                >
                    <form onSubmit={saveAgenda} className="space-y-4 text-black">
                        <input
                            value={agendaForm.agenda_timeframe}
                            onChange={e => setAgendaForm({ ...agendaForm, agenda_timeframe: e.target.value })}
                            placeholder="Timeframe"
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                        <input
                            value={agendaForm.agenda_title}
                            onChange={e => setAgendaForm({ ...agendaForm, agenda_title: e.target.value })}
                            placeholder="Title"
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                        <textarea
                            value={agendaForm.agenda_description}
                            onChange={e => setAgendaForm({ ...agendaForm, agenda_description: e.target.value })}
                            placeholder="Description"
                            className="w-full border rounded-lg px-3 py-2 h-24"
                        />
                        <select
                            value={agendaForm.agenda_status}
                            onChange={e => setAgendaForm({ ...agendaForm, agenda_status: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Declined</option>
                        </select>
                        <button className="w-full bg-purple-900 text-white py-2 rounded-lg">
                            {editingAgendaItem ? "Save" : "Add"}
                        </button>
                    </form>
                </Modal>

                {/* Logistic modal */}
                <Modal
                    isOpen={isLogisticModalOpen}
                    onClose={() => setLogisticModalOpen(false)}
                    title={editingLogisticTask ? "Edit Logistic Task" : "Add Logistic Task"}
                >
                    <form onSubmit={saveLogistic} className="space-y-4 text-black">
                        <input
                            value={newLogisticTask.logistic_title}
                            onChange={e => setNewLogisticTask({ ...newLogisticTask, logistic_title: e.target.value })}
                            placeholder="Title"
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                        <textarea
                            value={newLogisticTask.logistic_description}
                            onChange={e => setNewLogisticTask({ ...newLogisticTask, logistic_description: e.target.value })}
                            placeholder="Description"
                            className="w-full border rounded-lg px-3 py-2 h-24"
                        />
                        <select
                            value={newLogisticTask.logistic_status}
                            onChange={e => setNewLogisticTask({ ...newLogisticTask, logistic_status: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option>Pending</option>
                            <option>Completed</option>
                        </select>
                        <button className="w-full bg-purple-900 text-white py-2 rounded-lg">
                            {editingLogisticTask ? "Save" : "Add"}
                        </button>
                    </form>
                </Modal>

                {/* Logistic status quick-change */}
                <Modal
                    isOpen={isLogisticStatusOpen}
                    onClose={() => setLogisticStatusModalOpen(false)}
                    title="Update Task Status"
                >
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            updateLogisticStatus(
                                selectedLogisticTaskForStatus.logistic_id,
                                e.target.elements.status.value
                            );
                            setLogisticStatusModalOpen(false);
                        }}
                        className="space-y-4 text-black"
                    >
                        <select
                            name="status"
                            defaultValue={selectedLogisticTaskForStatus?.logistic_status}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option>Pending</option>
                            <option>Completed</option>
                        </select>
                        <button className="w-full bg-purple-900 text-white py-2 rounded-lg">
                            Update
                        </button>
                    </form>
                </Modal>
            </div>
        </Suspense>
    );
}
