"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import Modal from "../../components/Modal"; // Adjust path if needed

export default function CulturalEventPlanner() {
    const router = useRouter();

    // -------------------- CALENDAR --------------------
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const eventDate = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // -------------------- EVENT FORM STATES --------------------
    const [events, setEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDateInput, setEventDateInput] = useState("");
    const [eventStartTime, setEventStartTime] = useState("");
    const [eventEndTime, setEventEndTime] = useState("");

    // Venue search states
    const [venueSearchQuery, setVenueSearchQuery] = useState("");
    const [venueResults, setVenueResults] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);

    const [eventDescription, setEventDescription] = useState("");
    const [eventBudget, setEventBudget] = useState(50000);

    // -------------------- PARTICIPANT & LINKING STATES --------------------
    // 'participants' here holds the search results for linking purposes.
    const [participants, setParticipants] = useState([]);
    const [participantSearch, setParticipantSearch] = useState("");

    const [isParticipantModalOpen, setParticipantModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState(null);
    const [isParticipantDetailsModalOpen, setParticipantDetailsModalOpen] = useState(false);

    // Form for creating/updating a participant
    const [participantForm, setParticipantForm] = useState({
        participant_fullname: "",
        participant_description: "",
        ethnicity_id: "",
        category_id: "",
    });

    // Dropdowns for ethnicity & category
    const [ethnicities, setEthnicities] = useState([]);
    const [participantCategories, setParticipantCategories] = useState([]);

    // 'eventParticipants' holds those participants linked to the currently selected event (with RSVP)
    const [eventParticipants, setEventParticipants] = useState([]);

    // -------------------- AGENDA STATES --------------------
    const [agendaItems, setAgendaItems] = useState([]);
    const [isAgendaModalOpen, setAgendaModalOpen] = useState(false);
    const [editingAgendaItem, setEditingAgendaItem] = useState(null);
    const [selectedAgendaDetails, setSelectedAgendaDetails] = useState(null);
    const [isAgendaDetailsModalOpen, setAgendaDetailsModalOpen] = useState(false);
    const [agendaForm, setAgendaForm] = useState({
        agenda_timeframe: "",
        agenda_title: "",
        agenda_description: "",
        agenda_status: "Pending",
    });

    // -------------------- LOGISTIC STATES --------------------
    const [logisticTasks, setLogisticTasks] = useState([]);
    const [isLogisticModalOpen, setLogisticModalOpen] = useState(false);
    const [newLogisticTask, setNewLogisticTask] = useState({
        logistic_title: "",
        logistic_description: "",
    });
    const currentExpenses = 78000;
    const remainingBudget = eventBudget - currentExpenses;

    // -------------------- DATA FETCHING --------------------
    // 1) Load participants (for search); API must return ethnicity_name and category_name
    useEffect(() => {
        async function loadParticipants() {
            try {
                let url = "/api/participant";
                if (participantSearch) {
                    url += `?search=${encodeURIComponent(participantSearch)}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                setParticipants(data);
            } catch (err) {
                console.error("Failed to load participants:", err);
            }
        }
        loadParticipants();
    }, [participantSearch]);

    // 2) Load events
    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await fetch("/api/event");
                const data = await res.json();
                setEvents(data);
            } catch (err) {
                console.error("Failed to load events:", err);
            }
        }
        loadEvents();
    }, []);

    // 3) Load agenda items
    useEffect(() => {
        async function loadAgenda() {
            try {
                const res = await fetch("/api/agenda");
                const data = await res.json();
                setAgendaItems(data);
            } catch (err) {
                console.error("Failed to load agenda items:", err);
            }
        }
        loadAgenda();
    }, []);

    // 4) Load logistic tasks
    useEffect(() => {
        async function loadLogistics() {
            try {
                const res = await fetch("/api/logistic");
                const data = await res.json();
                setLogisticTasks(data);
            } catch (err) {
                console.error("Failed to load logistic tasks:", err);
            }
        }
        loadLogistics();
    }, []);

    // 5) Load dropdown data for ethnicities and participant categories
    useEffect(() => {
        fetch("/api/ethnicity")
            .then((res) => res.json())
            .then((data) => setEthnicities(data))
            .catch((err) => console.error("Failed to fetch ethnicities:", err));

        fetch("/api/participant_category")
            .then((res) => res.json())
            .then((data) => setParticipantCategories(data))
            .catch((err) => console.error("Failed to fetch participant categories:", err));
    }, []);

    // 6) Load linked participants for the selected event
    useEffect(() => {
        if (editingEvent && editingEvent.event_id) {
            fetch(`/api/event_participant?event_id=${editingEvent.event_id}`)
                .then((res) => res.json())
                .then((data) => setEventParticipants(data))
                .catch((err) => console.error("Failed to load event participants:", err));
        } else {
            setEventParticipants([]);
        }
    }, [editingEvent]);

    // 7) Venue search
    useEffect(() => {
        async function loadVenues() {
            try {
                let url = "/api/venue";
                if (venueSearchQuery.length > 2) {
                    url += `?search=${encodeURIComponent(venueSearchQuery)}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    setVenueResults(data);
                } else {
                    setVenueResults([]);
                }
            } catch (err) {
                console.error("Failed to load venues:", err);
            }
        }
        loadVenues();
    }, [venueSearchQuery]);

    // -------------------- HANDLERS --------------------
    // Create or update an event
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        const startDateTime = eventDateInput && eventStartTime
            ? `${eventDateInput} ${eventStartTime}:00`
            : null;
        const endDateTime = eventDateInput && eventEndTime
            ? `${eventDateInput} ${eventEndTime}:00`
            : null;
        const eventBody = {
            event_title: eventTitle,
            event_description: eventDescription,
            event_startdatetime: startDateTime,
            event_enddatetime: endDateTime,
            venue_id: selectedVenue ? selectedVenue.venue_id : null,
            event_budget: eventBudget,
        };

        try {
            if (editingEvent) {
                await fetch(`/api/event/${editingEvent.event_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(eventBody),
                });
            } else {
                await fetch("/api/event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(eventBody),
                });
            }
            const res = await fetch("/api/event");
            const data = await res.json();
            setEvents(data);

            // Reset event form
            setEditingEvent(null);
            setEventTitle("");
            setEventDateInput("");
            setEventStartTime("");
            setEventEndTime("");
            setSelectedVenue(null);
            setVenueSearchQuery("");
            setVenueResults([]);
            setEventDescription("");
            setEventBudget(50000);
        } catch (err) {
            console.error("Failed to save event:", err);
        }
    };

    // Select an event from the dropdown
    const handleSelectEvent = (e) => {
        const selectedId = parseInt(e.target.value);
        if (!isNaN(selectedId)) {
            const found = events.find((ev) => ev.event_id === selectedId);
            if (found) {
                setEditingEvent(found);
                setEventTitle(found.event_title || "");
                if (found.event_startdatetime) {
                    const dtStart = new Date(found.event_startdatetime);
                    setEventDateInput(dtStart.toISOString().split("T")[0]);
                    setEventStartTime(dtStart.toISOString().split("T")[1].slice(0, 5));
                }
                if (found.event_enddatetime) {
                    const dtEnd = new Date(found.event_enddatetime);
                    setEventEndTime(dtEnd.toISOString().split("T")[1].slice(0, 5));
                }
                if (found.venue_id) {
                    const selected = {
                        venue_id: found.venue_id,
                        venue_name: found.venue_name,
                        venue_category: found.venue_category,
                        venue_long: found.venue_long,
                        venue_lat: found.venue_lat,
                    };
                    setSelectedVenue(selected);
                    setVenueSearchQuery(selected.venue_name);
                } else {
                    setSelectedVenue(null);
                    setVenueSearchQuery("");
                }
                setEventDescription(found.event_description || "");
                setEventBudget(found.event_budget || 50000);
            }
        } else {
            // Reset if no event selected
            setEditingEvent(null);
            setEventTitle("");
            setEventDateInput("");
            setEventStartTime("");
            setEventEndTime("");
            setSelectedVenue(null);
            setVenueSearchQuery("");
            setEventDescription("");
            setEventBudget(50000);
        }
    };

    // Remove a linked participant from the event
    const handleRemoveParticipant = async (participantId) => {
        if (!editingEvent) return;
        if (!window.confirm("Are you sure you want to remove this participant from the event?"))
            return;
        try {
            await fetch(
                `/api/event_participant?event_id=${editingEvent.event_id}&participant_id=${participantId}`,
                { method: "DELETE" }
            );
            const res = await fetch(`/api/event_participant?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setEventParticipants(data);
        } catch (error) {
            console.error("Error removing participant:", error);
        }
    };

    // Update RSVP status
    const handleRsvpChange = async (participantId, newStatus) => {
        if (!editingEvent) return;
        try {
            await fetch(`/api/participant_rsvp`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: editingEvent.event_id,
                    participant_id: participantId,
                    rsvp_status: newStatus,
                }),
            });
            setEventParticipants((prev) =>
                prev.map((p) =>
                    p.participant_id === participantId ? { ...p, rsvp_status: newStatus } : p
                )
            );
        } catch (error) {
            console.error("Error updating RSVP status:", error);
        }
    };

    // Link a participant (from search results) to the event
    const handleLinkParticipantFromMain = async (participantId) => {
        if (!editingEvent || !editingEvent.event_id) {
            alert("Please select an event first.");
            return;
        }
        try {
            await fetch("/api/event_participant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: editingEvent.event_id,
                    participant_id: participantId,
                    rsvp_status: "Pending",
                }),
            });
            const res = await fetch(`/api/event_participant?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setEventParticipants(data);
        } catch (error) {
            console.error("Error linking participant:", error);
        }
    };

    // Create or update a participant (via modal)
    const handleParticipantSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingParticipant) {
                await fetch(`/api/participant/${editingParticipant.participant_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(participantForm),
                });
            } else {
                await fetch("/api/participant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(participantForm),
                });
            }
            let url = "/api/participant";
            if (participantSearch) {
                url += `?search=${encodeURIComponent(participantSearch)}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setParticipants(data);
            setEditingParticipant(null);
            setParticipantForm({
                participant_fullname: "",
                participant_description: "",
                ethnicity_id: "",
                category_id: "",
            });
            setParticipantModalOpen(false);
        } catch (err) {
            console.error("Failed to save participant:", err);
        }
    };

    // Logistics
    const handleLogisticSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch("/api/logistic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLogisticTask),
            });
            const res = await fetch("/api/logistic");
            const data = await res.json();
            setLogisticTasks(data);
            setNewLogisticTask({ logistic_title: "", logistic_description: "" });
            setLogisticModalOpen(false);
        } catch (err) {
            console.error("Failed to create logistic task:", err);
        }
    };

    const toggleLogisticTask = async (id) => {
        const task = logisticTasks.find((x) => x.logistic_id === id);
        if (!task) return;
        const updated = { ...task, logistic_completed: !task.logistic_completed };
        try {
            await fetch(`/api/logistic/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            const res = await fetch("/api/logistic");
            const data = await res.json();
            setLogisticTasks(data);
        } catch (err) {
            console.error("Failed to toggle logistic task:", err);
        }
    };

    // Agenda
    const handleAgendaSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAgendaItem) {
                await fetch(`/api/agenda/${editingAgendaItem.agenda_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(agendaForm),
                });
            } else {
                await fetch("/api/agenda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(agendaForm),
                });
            }
            const res = await fetch("/api/agenda");
            const data = await res.json();
            setAgendaItems(data);
            setEditingAgendaItem(null);
            setAgendaForm({
                agenda_timeframe: "",
                agenda_title: "",
                agenda_description: "",
                agenda_status: "Pending",
            });
            setAgendaModalOpen(false);
        } catch (err) {
            console.error("Failed to save agenda item:", err);
        }
    };

    // -------------------- RENDER --------------------
    return (
        <div className="bg-gray-50 min-h-screen text-black relative">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                <header className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Cultural Event Planner</h1>
                    <div>
                        <select
                            value={editingEvent ? editingEvent.event_id : ""}
                            onChange={handleSelectEvent}
                            className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select event to edit</option>
                            {events.map((ev) => (
                                <option key={ev.event_id} value={ev.event_id}>
                                    {ev.event_title}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="col-span-2">
                        {/* EVENT FORM */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingEvent ? "Edit Event Details" : "Create New Event"}
                            </h2>
                            <form onSubmit={handleEventSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter event title"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={eventDateInput}
                                            onChange={(e) => setEventDateInput(e.target.value)}
                                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={eventStartTime}
                                                onChange={(e) => setEventStartTime(e.target.value)}
                                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">End Time</label>
                                            <input
                                                type="time"
                                                value={eventEndTime}
                                                onChange={(e) => setEventEndTime(e.target.value)}
                                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* VENUE SEARCH */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Venue</label>
                                    <input
                                        type="text"
                                        value={venueSearchQuery}
                                        onChange={(e) => {
                                            setVenueSearchQuery(e.target.value);
                                            setSelectedVenue(null);
                                        }}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Search venue by name"
                                    />
                                    {venueResults.length > 0 && (
                                        <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto bg-white">
                                            {venueResults.map((venue) => (
                                                <div
                                                    key={venue.venue_id}
                                                    className="p-2 cursor-pointer hover:bg-gray-200 text-black"
                                                    onClick={() => {
                                                        setSelectedVenue(venue);
                                                        setVenueSearchQuery(venue.venue_name);
                                                        setVenueResults([]);
                                                    }}
                                                >
                                                    {venue.venue_name} ({venue.venue_category})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedVenue && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Selected Venue: {selectedVenue.venue_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={eventDescription}
                                        onChange={(e) => setEventDescription(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 h-32"
                                        placeholder="Enter event description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Budget</label>
                                    <input
                                        type="number"
                                        value={eventBudget}
                                        onChange={(e) => setEventBudget(Number(e.target.value))}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter total budget"
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-primary rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-primary/90"
                                    >
                                        {editingEvent ? (
                                            <>
                                                <i className="ri-edit-line mr-2" />
                                                Save Changes
                                            </>
                                        ) : (
                                            <>
                                                <i className="ri-add-line mr-2" />
                                                Create Event
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* LINKED PARTICIPANTS SECTION (only shown if an event is selected) */}
                        {editingEvent ? (
                            <div className="bg-white shadow rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                        Linked Participants (Event: {editingEvent.event_title})
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setEditingParticipant(null);
                                            setParticipantForm({
                                                participant_fullname: "",
                                                participant_description: "",
                                                ethnicity_id: "",
                                                category_id: "",
                                            });
                                            setParticipantModalOpen(true);
                                        }}
                                        className="rounded bg-primary px-3 py-1.5 text-sm font-medium flex items-center hover:bg-primary/90 text-white"
                                    >
                                        <i className="ri-user-add-line mr-2" />
                                        Create Participant
                                    </button>
                                </div>
                                {/* Optional: Search box to link existing participants */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={participantSearch}
                                        onChange={(e) => setParticipantSearch(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2"
                                        placeholder="Search participants to link..."
                                    />
                                </div>
                                {eventParticipants.length === 0 ? (
                                    <p className="text-sm">No participants linked yet.</p>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Full Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                RSVP Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {eventParticipants.map((p) => (
                                            <tr key={p.participant_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {p.participant_fullname}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {p.participant_description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <select
                                                        value={p.rsvp_status || "Pending"}
                                                        onChange={(e) => handleRsvpChange(p.participant_id, e.target.value)}
                                                        className="border rounded"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleRemoveParticipant(p.participant_id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg p-6 mb-8">
                                <p className="text-sm">
                                    No event selected. Please select an event above to manage linked participants.
                                </p>
                            </div>
                        )}

                        {/* AGENDA SECTION */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Event Agenda</h2>
                                <button
                                    onClick={() => {
                                        setEditingAgendaItem(null);
                                        setAgendaForm({
                                            agenda_timeframe: "",
                                            agenda_title: "",
                                            agenda_description: "",
                                            agenda_status: "Pending",
                                        });
                                        setAgendaModalOpen(true);
                                    }}
                                    className="rounded border border-primary/20 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/5 flex items-center"
                                >
                                    <i className="ri-add-line mr-2" />
                                    Add Agenda Item
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                {agendaItems.length === 0 ? (
                                    <p className="text-sm">No agenda items added.</p>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200 mb-6">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Timeframe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {agendaItems.map((item) => (
                                            <tr key={item.agenda_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.agenda_timeframe}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.agenda_title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.agenda_description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {item.agenda_status}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingAgendaItem(item);
                                                                setAgendaForm({
                                                                    agenda_timeframe: item.agenda_timeframe,
                                                                    agenda_title: item.agenda_title,
                                                                    agenda_description: item.agenda_description,
                                                                    agenda_status: item.agenda_status,
                                                                });
                                                                setAgendaModalOpen(true);
                                                            }}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            <i className="ri-edit-line" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAgendaDetails(item);
                                                                setAgendaDetailsModalOpen(true);
                                                            }}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            <i className="ri-eye-line" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">
                        {/* CALENDAR */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
                            <div className="space-y-4">
                                <div id="calendar" className="w-full mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <button onClick={handlePrevMonth} className="hover:text-primary">
                                            <i className="ri-arrow-left-s-line ri-lg" />
                                        </button>
                                        <h3 className="text-lg font-medium">
                                            {monthNames[currentMonth]} {currentYear}
                                        </h3>
                                        <button onClick={handleNextMonth} className="hover:text-primary">
                                            <i className="ri-arrow-right-s-line ri-lg" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                            <div key={day} className="text-xs font-medium">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div id="calendarDays" className="grid grid-cols-7 gap-1">
                                        {[...Array(firstDayOfMonth)].map((_, idx) => (
                                            <div key={`empty-${idx}`} className="h-10" />
                                        ))}
                                        {[...Array(daysInMonth)].map((_, idx) => {
                                            const dayNum = idx + 1;
                                            const isToday =
                                                currentYear === eventDate.year &&
                                                currentMonth === eventDate.month &&
                                                dayNum === eventDate.day;
                                            return (
                                                <div
                                                    key={`day-${dayNum}`}
                                                    className={`h-10 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-gray-100 ${
                                                        isToday ? "bg-primary text-white hover:bg-primary/90" : ""
                                                    }`}
                                                >
                                                    {dayNum}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* REMINDER */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Reminder</h2>
                            <div className="space-y-4">
                                <p className="text-sm">
                                    Automated reminders can be scheduled to notify participants of upcoming events.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Remind me in</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="48h Before the Event"
                                    />
                                </div>
                                <button className="rounded bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center whitespace-nowrap text-white">
                                    Schedule Reminder
                                </button>
                            </div>
                        </div>

                        {/* FINANCIAL OVERVIEW */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium mb-2">Total Budget</h3>
                                    <p className="text-2xl font-bold">${eventBudget.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium mb-2">Current Expenses</h3>
                                    <p className="text-2xl font-bold">${currentExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium mb-2">Budget Remaining</h3>
                                    <p className="text-2xl font-bold">${remainingBudget.toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => router.push("/finance")}
                                    className="bg-primary px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap text-white"
                                >
                                    View Detailed Finance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* PARTICIPANT MODALS */}
            <Modal
                isOpen={isParticipantModalOpen}
                onClose={() => setParticipantModalOpen(false)}
                title={editingParticipant ? "Edit Participant" : "Create Participant"}
            >
                <form onSubmit={handleParticipantSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={participantForm.participant_fullname}
                        onChange={(e) =>
                            setParticipantForm({
                                ...participantForm,
                                participant_fullname: e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={participantForm.participant_description}
                        onChange={(e) =>
                            setParticipantForm({
                                ...participantForm,
                                participant_description: e.target.value,
                            })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    <select
                        value={participantForm.ethnicity_id}
                        onChange={(e) =>
                            setParticipantForm({ ...participantForm, ethnicity_id: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select Ethnicity</option>
                        {ethnicities.map((eth) => (
                            <option key={eth.ethnicity_id} value={eth.ethnicity_id}>
                                {eth.ethnicity_name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={participantForm.category_id}
                        onChange={(e) =>
                            setParticipantForm({ ...participantForm, category_id: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    >
                        <option value="">Select Category</option>
                        {participantCategories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.category_name}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-white">
                        {editingParticipant ? "Save Changes" : "Create Participant"}
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isParticipantDetailsModalOpen}
                onClose={() => setParticipantDetailsModalOpen(false)}
                title="Participant Details"
            >
                <div className="max-h-[400px] overflow-y-auto text-black">
                    {selectedParticipantDetails && (
                        <div className="space-y-2">
                            <p>
                                <strong>Full Name:</strong> {selectedParticipantDetails.participant_fullname}
                            </p>
                            <p>
                                <strong>Description:</strong> {selectedParticipantDetails.participant_description}
                            </p>
                            <p>
                                <strong>Ethnicity:</strong> {selectedParticipantDetails.ethnicity_name}
                            </p>
                            <p>
                                <strong>Category:</strong> {selectedParticipantDetails.category_name}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* AGENDA MODAL */}
            <Modal
                isOpen={isAgendaModalOpen}
                onClose={() => setAgendaModalOpen(false)}
                title={editingAgendaItem ? "Edit Agenda Item" : "Add Agenda Item"}
            >
                <form onSubmit={handleAgendaSubmit} className="space-y-4 text-black">
                    <div>
                        <label className="block text-sm font-medium mb-1">Timeframe</label>
                        <input
                            type="text"
                            value={agendaForm.agenda_timeframe}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, agenda_timeframe: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="e.g., 09:00 - 09:30"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={agendaForm.agenda_title}
                            onChange={(e) => setAgendaForm({ ...agendaForm, agenda_title: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Enter agenda title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={agendaForm.agenda_description}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, agenda_description: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Enter description"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={agendaForm.agenda_status}
                            onChange={(e) => setAgendaForm({ ...agendaForm, agenda_status: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Declined">Declined</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-primary/90 text-white"
                    >
                        {editingAgendaItem ? "Save Changes" : "Add Agenda Item"}
                    </button>
                </form>
            </Modal>

            {/* LOGISTIC MODAL */}
            <Modal
                isOpen={isLogisticModalOpen}
                onClose={() => setLogisticModalOpen(false)}
                title="Add Logistic Task"
            >
                <form onSubmit={handleLogisticSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={newLogisticTask.logistic_title}
                        onChange={(e) =>
                            setNewLogisticTask({ ...newLogisticTask, logistic_title: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />
                    <textarea
                        placeholder="Task Description"
                        value={newLogisticTask.logistic_description}
                        onChange={(e) =>
                            setNewLogisticTask({ ...newLogisticTask, logistic_description: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-white">
                        Save Task
                    </button>
                </form>
            </Modal>
        </div>
    );
}
