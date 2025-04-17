"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import Modal from "../../components/Modal"; // Adjust the import as needed

//export const dynamic = 'force-dynamic';

export default function CulturalEventPlanner() {
    const router = useRouter();
    //const searchParams = useSearchParams();

    // -------------------- CALENDAR --------------------
    const nowLocal = new Date();
// 2) Convert local→UTC
    const utcMs    = nowLocal.getTime() + nowLocal.getTimezoneOffset() * 60000;
// 3) Add AEST offset
    const aestMs   = utcMs + 10 * 60 * 60 * 1000;
// 4) Create an AEST “today” Date
    const today = new Date(aestMs);


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
    const minDate = today.toISOString().split("T")[0];
    const nowTime = today.toTimeString().slice(0, 5);
    const isToday = eventDateInput === minDate;
    const minTime = isToday ? nowTime : "00:00";
    const [eventStartTime, setEventStartTime] = useState("");
    const [eventEndTime, setEventEndTime] = useState("");

    // Venue search
    const [venueSearchQuery, setVenueSearchQuery] = useState("");
    const [venueResults, setVenueResults] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);

    const [eventDescription, setEventDescription] = useState("");
    const [eventBudget, setEventBudget] = useState(50000);

    // -------------------- PARTICIPANT & LINKING STATES --------------------
    const [participants, setParticipants] = useState([]);
    const [participantSearch, setParticipantSearch] = useState("");

    const [isParticipantModalOpen, setParticipantModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState(null);
    const [isParticipantDetailsModalOpen, setParticipantDetailsModalOpen] = useState(false);

    // "Select Participant" modal state.
    const [isSelectParticipantModalOpen, setSelectParticipantModalOpen] = useState(false);
    const [selectParticipantMode, setSelectParticipantMode] = useState("list");

    // Form for creating/updating a participant.
    const [participantForm, setParticipantForm] = useState({
        participant_fullname: "",
        participant_description: "",
        ethnicity_id: "",
        category_id: "",
    });

    // Dropdown data for ethnicity and participant category.
    const [ethnicities, setEthnicities] = useState([]);
    const [participantCategories, setParticipantCategories] = useState([]);

    // Participants linked to the selected event.
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
    const [editingLogisticTask, setEditingLogisticTask] = useState(null);
    const [newLogisticTask, setNewLogisticTask] = useState({
        logistic_title: "",
        logistic_description: "",
        logistic_status: "Pending",
    });
    const [isLogisticStatusModalOpen, setLogisticStatusModalOpen] = useState(false);
    const [selectedLogisticTaskForStatus, setSelectedLogisticTaskForStatus] = useState(null);

    // -------------------- EXPENSES & FINANCIAL OVERVIEW --------------------
    const [currentExpenses, setCurrentExpenses] = useState(0);
    const remainingBudget = eventBudget - currentExpenses;

    // -------------------- REMINDER STATE (using cookies) --------------------
    const [reminderOption, setReminderOption] = useState("48h Before");

    useEffect(() => {
        const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
            const [key, value] = cookie.split("=");
            acc[key] = value;
            return acc;
        }, {});
        if (cookies.reminder) {
            setReminderOption(decodeURIComponent(cookies.reminder));
        }
    }, []);

    // -------------------- HELPER FUNCTIONS FOR CALENDAR INTEGRATION --------------------
    const getGoogleCalendarLink = () => {
        if (!eventTitle || !eventDateInput || !eventStartTime || !eventEndTime) return "#";
        const startDate = new Date(`${eventDateInput}T${eventStartTime}:00`);
        const endDate = new Date(`${eventDateInput}T${eventEndTime}:00`);
        const formatDate = (date) =>
            date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        const text = encodeURIComponent(eventTitle);
        const details = encodeURIComponent(eventDescription || "");
        const location = encodeURIComponent(selectedVenue ? selectedVenue.venue_name : "");
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
    };

    const getICSFileContent = () => {
        if (!eventTitle || !eventDateInput || !eventStartTime || !eventEndTime)
            return "";
        const startDate = new Date(`${eventDateInput}T${eventStartTime}:00`);
        const endDate = new Date(`${eventDateInput}T${eventEndTime}:00`);
        const formatDate = (date) =>
            date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const start = formatDate(startDate);
        const end = formatDate(endDate);
        const summary = eventTitle;
        const description = eventDescription || "";
        const location = selectedVenue ? selectedVenue.venue_name : "";
        return `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR
        `.trim();
    };

    const downloadICS = () => {
        const icsContent = getICSFileContent();
        if (!icsContent) return;
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "event.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // -------------------- HANDLERS --------------------
    // Create or update an event.
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        const startDateTime =
            eventDateInput && eventStartTime ? `${eventDateInput} ${eventStartTime}:00` : null;
        const endDateTime =
            eventDateInput && eventEndTime ? `${eventDateInput} ${eventEndTime}:00` : null;
        const eventBody = {
            event_title: eventTitle,
            event_description: eventDescription,
            event_startdatetime: startDateTime,
            event_enddatetime: endDateTime,
            venue_id: selectedVenue ? selectedVenue.venue_id : null,
            event_budget: eventBudget,
            currentExpenses: currentExpenses,
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
            setCurrentExpenses(0);
        } catch (err) {
            console.error("Failed to save event:", err);
        }
    };

    // New: Delete an existing event
    const handleDeleteEvent = async () => {
        if (!editingEvent) return;
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await fetch(`/api/event/${editingEvent.event_id}`, {
                method: "DELETE",
            });
            // Re-fetch updated events after deletion
            const res = await fetch("/api/event");
            const data = await res.json();
            setEvents(data);

            // Reset the form
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
            console.error("Failed to delete event:", err);
        }
    };

    // Select an event from dropdown
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
            // Reset if no event
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


    // -------------------- Participant handlers (link, remove, etc.) --------------------
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

    const handleDeleteParticipant = async (participantId) => {
        if (!window.confirm("Are you sure you want to delete this participant?")) return;
        try {
            await fetch(`/api/participant/${participantId}`, { method: "DELETE" });
            const res = await fetch("/api/participant");
            const data = await res.json();
            setParticipants(data);
        } catch (error) {
            console.error("Error deleting participant:", error);
        }
    };

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
            setSelectParticipantMode("list");
        } catch (err) {
            console.error("Failed to save participant:", err);
        }
    };

    // -------------------- Agenda Handlers --------------------
    const handleAgendaSubmit = async (e) => {
        e.preventDefault();
        if (!editingEvent || !editingEvent.event_id) {
            alert("Please select an event before adding an agenda item.");
            return;
        }
        const payload = { ...agendaForm, event_id: editingEvent.event_id };
        try {
            if (editingAgendaItem) {
                await fetch(`/api/agenda/${editingAgendaItem.agenda_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch("/api/agenda", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            const res = await fetch(`/api/agenda?event_id=${editingEvent.event_id}`);
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

    const handleDeleteAgendaItem = async (agendaId) => {
        if (!window.confirm("Are you sure you want to delete this agenda item?")) return;
        try {
            await fetch(`/api/agenda?agenda_id=${agendaId}`, { method: "DELETE" });
            const res = await fetch(`/api/agenda?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setAgendaItems(data);
        } catch (err) {
            console.error("Error deleting agenda item:", err);
        }
    };

    // -------------------- Logistic Handlers --------------------
    const handleLogisticSubmit = async (e) => {
        e.preventDefault();
        if (!editingEvent || !editingEvent.event_id) {
            alert("Please select an event before adding a logistic task.");
            return;
        }
        const payload = { ...newLogisticTask, event_id: editingEvent.event_id };
        try {
            if (editingLogisticTask) {
                await fetch(`/api/logistics/${editingLogisticTask.logistic_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch("/api/logistics", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            const res = await fetch(`/api/logistics?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setLogisticTasks(data);
            setNewLogisticTask({ logistic_title: "", logistic_description: "", logistic_status: "Pending" });
            setEditingLogisticTask(null);
            setLogisticModalOpen(false);
        } catch (err) {
            console.error("Failed to submit logistic task:", err);
        }
    };

    const handleDeleteLogisticTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this logistic task?")) return;
        try {
            await fetch(`/api/logistics?logistic_id=${taskId}`, { method: "DELETE" });
            const res = await fetch(`/api/logistics?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setLogisticTasks(data);
        } catch (err) {
            console.error("Error deleting logistic task:", err);
        }
    };

    const toggleLogisticTask = async (id) => {
        const task = logisticTasks.find((x) => x.logistic_id === id);
        if (!task) return;
        const updated = {
            ...task,
            logistic_status: task.logistic_status === "Pending" ? "Completed" : "Pending",
        };
        try {
            await fetch(`/api/logistics/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            const res = await fetch(`/api/logistics?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setLogisticTasks(data);
        } catch (err) {
            console.error("Failed to toggle logistic task:", err);
        }
    };

    const handleOpenLogisticStatusModal = (task) => {
        setSelectedLogisticTaskForStatus(task);
        setLogisticStatusModalOpen(true);
    };

    const handleLogisticStatusSubmit = async (e) => {
        e.preventDefault();
        const newStatus = e.target.elements.status.value;
        try {
            const updated = { ...selectedLogisticTaskForStatus, logistic_status: newStatus };
            await fetch(`/api/logistics/${selectedLogisticTaskForStatus.logistic_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            const res = await fetch(`/api/logistics?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setLogisticTasks(data);
            setLogisticStatusModalOpen(false);
            setSelectedLogisticTaskForStatus(null);
        } catch (err) {
            console.error("Failed to update logistic status:", err);
        }
    };

    // Handler to remove participant from event (if you need it)
    const handleRemoveParticipant = async (participantId) => {
        if (!editingEvent) return;
        if (!window.confirm("Are you sure you want to remove this participant from the event?")) return;
        try {
            await fetch(`/api/event_participant`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event_id: editingEvent.event_id,
                    participant_id: participantId,
                }),
            });
            const res = await fetch(`/api/event_participant?event_id=${editingEvent.event_id}`);
            const data = await res.json();
            setEventParticipants(data);
        } catch (error) {
            console.error("Error removing participant from event:", error);
        }
    };

    // -------------------- REMINDER HANDLER --------------------
    const handleScheduleReminder = () => {
        document.cookie = `reminder=${encodeURIComponent(
            reminderOption
        )}; path=/; max-age=31536000`; // cookie valid for 1 year
        alert(`Reminder scheduled: ${reminderOption}`);
    };

    // -------------------- DATA FETCHING --------------------
    // 1) Load participants.
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

    // 2) Load events.
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

    // 3) Load agenda items for the selected event.
    useEffect(() => {
        async function loadAgenda() {
            if (editingEvent && editingEvent.event_id) {
                try {
                    const res = await fetch(`/api/agenda?event_id=${editingEvent.event_id}`);
                    const data = await res.json();
                    setAgendaItems(data);
                } catch (err) {
                    console.error("Failed to load agenda items for event:", err);
                }
            } else {
                setAgendaItems([]);
            }
        }
        loadAgenda();
    }, [editingEvent]);

    // 4) Load logistic tasks for the selected event.
    useEffect(() => {
        async function loadLogistics() {
            if (editingEvent && editingEvent.event_id) {
                try {
                    const res = await fetch(`/api/logistics?event_id=${editingEvent.event_id}`);
                    const data = await res.json();
                    setLogisticTasks(data);
                } catch (err) {
                    console.error("Failed to load logistic tasks:", err);
                }
            } else {
                setLogisticTasks([]);
            }
        }
        loadLogistics();
    }, [editingEvent]);

    // 5) Load dropdown data.
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

    // 6) Load participants linked to the selected event.
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

    // 7) Venue search.
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

    // 8) Load financial expenses for the selected event.
    useEffect(() => {
        if (editingEvent) {
            setCurrentExpenses(editingEvent.current_expenses ?? 0);
        } else {
            setCurrentExpenses(0);
        }
    }, [editingEvent]);


    // -------------------- RENDER --------------------
    return (
        <Suspense fallback={<div>Loading Event Planner...</div>}>
        <div className="bg-gray-50 min-h-screen text-black relative">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                {/* HEADER: Event Selection */}
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
                                            min={minDate} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                                min = {minTime} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">End Time</label>
                                            <input
                                                type="time"
                                                value={eventEndTime}
                                                onChange={(e) => setEventEndTime(e.target.value)}
                                                min = {eventStartTime} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                    {!selectedVenue && venueResults.length > 0 && (
                                        <div className="border rounded-lg mt-1 bg-white max-h-40 overflow-y-auto">
                                            {venueResults.map((venue) => (
                                                <div
                                                    key={venue.venue_id}
                                                    className="p-2 cursor-pointer hover:bg-gray-200 text-black"
                                                    onClick={() => {
                                                        setSelectedVenue(venue);
                                                        setVenueSearchQuery(venue.venue_name);
                                                        // no need to clear results here since the effect will do it
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
                                <div className="mt-4 flex space-x-2">
                                    {editingEvent ? (
                                        <>
                                            <button
                                                type="submit"
                                                className="bg-purple-900 rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 text-white flex items-center"
                                            >
                                                <i className="ri-edit-line mr-2" />
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDeleteEvent}
                                                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-400 bg-purple-900 text-white"
                                            >
                                                Delete Event
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="w-full bg-purple-900 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-primary/90 text-white"
                                        >
                                            <i className="ri-add-line mr-2" />
                                            Create Event
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* LINKED PARTICIPANTS SECTION */}
                        {editingEvent ? (
                            <div className="bg-white shadow rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">
                                        Linked Participants (Event: {editingEvent.event_title})
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setParticipantSearch("");
                                            setSelectParticipantMode("list");
                                            setSelectParticipantModalOpen(true);
                                        }}
                                        className="rounded bg-purple-900 px-3 py-1.5 text-sm font-medium flex items-center hover:bg-primary/90 text-white"
                                    >
                                        Select Participant
                                    </button>
                                </div>
                                {eventParticipants.length === 0 ? (
                                    <p className="text-sm">No participants linked yet.</p>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                                    <table className="table-fixed w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                Full Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                Ethnicity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                RSVP
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {eventParticipants.map((p) => (
                                            <tr key={p.participant_id}>
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
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <select
                                                        value={p.rsvp_status || "Pending"}
                                                        onChange={(e) =>
                                                            handleRsvpChange(p.participant_id, e.target.value)
                                                        }
                                                        className="border rounded"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected">Rejected</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleRemoveParticipant(p.participant_id)}
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
                            </div>
                        ) : (
                            <div className="bg-white shadow rounded-lg p-6 mb-8">
                                <p className="text-sm">
                                    No event selected. Please select an event above to manage linked participants.
                                </p>
                            </div>
                        )}

                        {/* AGENDA SECTION */}
                        {editingEvent && (
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
                                        className="rounded border border-primary/20 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/5 flex items-center bg-purple-900 text-white"
                                    >
                                        <i className="ri-add-line mr-2" />
                                        Add Agenda Item
                                    </button>
                                </div>
                                {agendaItems.length === 0 ? (
                                    <p className="text-sm">No agenda items added for this event.</p>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                                    <table className="table-fixed w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Timeframe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 scroll-auto overflow-y-auto">
                                        {agendaItems.map((item) => (
                                            <tr key={item.agenda_id}>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {item.agenda_timeframe}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {item.agenda_title}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {item.agenda_description}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {item.agenda_status}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
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
                                                            className="text-blue-500 hover:underline "
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAgendaItem(item.agenda_id)}
                                                            className="text-red-500 hover:underline "
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAgendaDetails(item);
                                                                setAgendaDetailsModalOpen(true);
                                                            }}
                                                            className="text-gray-500 hover:underline "
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* LOGISTIC TASKS SECTION */}
                        {editingEvent && (
                            <div className="bg-white shadow rounded-lg p-6 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Logistic Tasks</h2>
                                    <button
                                        onClick={() => {
                                            setEditingLogisticTask(null);
                                            setNewLogisticTask({
                                                logistic_title: "",
                                                logistic_description: "",
                                                logistic_status: "Pending",
                                            });
                                            setLogisticModalOpen(true);
                                        }}
                                        className="rounded border border-primary/20 text-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/5 flex items-center bg-purple-900 text-white"
                                    >
                                        <i className="ri-add-line mr-2" />
                                        Add Logistic Task
                                    </button>
                                </div>
                                {logisticTasks.length === 0 ? (
                                    <p className="text-sm">No logistic tasks added for this event.</p>
                                ) : (
                                   <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                                    <table className="table-fixed w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {logisticTasks.map((task) => (
                                            <tr key={task.logistic_id}>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {task.logistic_title}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {task.logistic_description}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {task.logistic_status}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingLogisticTask(task);
                                                                setNewLogisticTask({
                                                                    logistic_title: task.logistic_title,
                                                                    logistic_description: task.logistic_description,
                                                                    logistic_status: task.logistic_status,
                                                                });
                                                                setLogisticModalOpen(true);
                                                            }}
                                                            className="text-blue-500 hover:underline "
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenLogisticStatusModal(task)}
                                                            className="text-green-600 hover:underline "
                                                        >
                                                            Status
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLogisticTask(task.logistic_id)}
                                                            className="text-red-500 hover:underline "
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                   </div>
                                )}
                            </div>
                        )}
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
                                                        isToday ? "bg-purple-900 text-white hover:bg-purple-500/90" : ""
                                                    }`}
                                                >
                                                    {dayNum}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Google Calendar and Apple Calendar Buttons */}
                                <div className="mt-4 flex space-x-2">
                                    <a
                                        href={getGoogleCalendarLink()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-purple-900 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
                                    >
                                        Add to Google Calendar
                                    </a>
                                    <button
                                        onClick={downloadICS}
                                        className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium"
                                    >
                                        Add to Apple Calendar
                                    </button>
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
                                    <select
                                        value={reminderOption}
                                        onChange={(e) => setReminderOption(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="15 minutes Before">15 minutes Before</option>
                                        <option value="30 minutes Before">30 minutes Before</option>
                                        <option value="1 hour Before">1 hour Before</option>
                                        <option value="48h Before">48h Before</option>
                                        <option value="1 week Before">1 week Before</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleScheduleReminder}
                                    className="rounded bg-purple-900 px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center whitespace-nowrap text-white"
                                >
                                    Schedule Reminder
                                </button>
                            </div>
                        </div>

                        {/* FINANCIAL OVERVIEW */}
                        {editingEvent && (
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
                                        onClick={() => router.push(`/finance?event_id=${editingEvent.event_id}`)}
                                        className="bg-purple-900 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap text-white"
                                    >
                                        Detailed Finance
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Participant Modal */}
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
                    <button type="submit" className="w-full bg-purple-900 rounded-lg px-4 py-2 text-white">
                        {editingParticipant ? "Save Participant" : "Create Participant"}
                    </button>
                </form>
            </Modal>

            {/* Participant Details Modal */}
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

            {/* Select Participant Modal */}
            {isSelectParticipantModalOpen && (
                <Modal
                    isOpen={isSelectParticipantModalOpen}
                    onClose={() => setSelectParticipantModalOpen(false)}
                    title="Select Participant"
                >
                    {selectParticipantMode === "list" ? (
                        <>
                            <input
                                type="text"
                                placeholder="Search participants..."
                                value={participantSearch}
                                onChange={(e) => setParticipantSearch(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 mb-4 text-black"
                            />
                            {/* <-- If you truly want no vertical scrollbars, remove overflow-y-auto and let the container expand.
                                 But that can lead to a very tall list. For a large participant list, you might still prefer some vertical scrolling. */}
                            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                                {participants.length > 0 ? (
                                    // <-- UPDATED: table-fixed and truncate classes
                                    <table className="table-fixed w-full divide-y divide-gray-200 text-sm">
                                        <thead>
                                        <tr>
                                            <th className="px-2 py-1 text-left uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                Full Name
                                            </th>
                                            <th className="px-2 py-1 text-left uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                Category
                                            </th>
                                            <th className="px-2 py-1 text-left uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                Ethnicity
                                            </th>
                                            <th className="px-2 py-1 text-left uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {participants.map((p) => (
                                            <tr key={p.participant_id}>
                                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                                    {p.participant_fullname}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                                    {p.category_name || "—"}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                                    {p.ethnicity_name || "—"}
                                                </td>
                                                <td className="px-2 py-1 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingParticipant(p);
                                                                setParticipantForm({
                                                                    participant_fullname: p.participant_fullname,
                                                                    participant_description: p.participant_description,
                                                                    ethnicity_id: p.ethnicity_id || "",
                                                                    category_id: p.category_id || "",
                                                                });
                                                                setSelectParticipantMode("create");
                                                            }}
                                                            className="text-blue-500 hover:underline "
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteParticipant(p.participant_id)}
                                                            className="text-red-500 hover:underline "
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => handleLinkParticipantFromMain(p.participant_id)}
                                                            className="text-green-600 hover:underline "
                                                        >
                                                            Link
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-sm text-gray-500">No participants found.</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectParticipantMode("create")}
                                className="mt-4 px-4 py-2 bg-purple-900 text-white"
                            >
                                Create New Participant
                            </button>
                        </>
                    ) : (
                        <>
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
                                <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                                    {editingParticipant ? "Save Participant" : "Create Participant"}
                                </button>
                            </form>
                            <button
                                onClick={() => setSelectParticipantMode("list")}
                                className="mt-4 px-4 py-2 bg-purple-900 text-white"
                            >
                                Back to List
                            </button>
                        </>
                    )}
                </Modal>
            )}

            {/* EXISTING PARTICIPANT MODAL */}
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
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 bg-purple-900 text-white">
                        {editingParticipant ? "Save Participant" : "Create Participant"}
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

            {/* Agenda Modal */}
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
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, agenda_title: e.target.value })
                            }
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
                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="w-full bg-purple-900 rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-primary/90 text-white"
                        >
                            {editingAgendaItem ? "Save Changes" : "Add Agenda Item"}
                        </button>
                        {editingAgendaItem && (
                            <button
                                type="button"
                                onClick={() => handleDeleteAgendaItem(editingAgendaItem.agenda_id)}
                                className="w-full rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-red-400 bg-purple-900 text-white"
                            >
                                Delete Agenda
                            </button>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Logistic Task Modal */}
            <Modal
                isOpen={isLogisticModalOpen}
                onClose={() => {
                    setLogisticModalOpen(false);
                    setEditingLogisticTask(null);
                    setNewLogisticTask({
                        logistic_title: "",
                        logistic_description: "",
                        logistic_status: "Pending",
                    });
                }}
                title={editingLogisticTask ? "Edit Logistic Task" : "Add Logistic Task"}
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
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={newLogisticTask.logistic_status || "Pending"}
                            onChange={(e) =>
                                setNewLogisticTask({ ...newLogisticTask, logistic_status: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-white bg-purple-900">
                            {editingLogisticTask ? "Save Changes" : "Save Task"}
                        </button>
                        {editingLogisticTask && (
                            <button
                                type="button"
                                onClick={() => handleDeleteLogisticTask(editingLogisticTask.logistic_id)}
                                className="w-full rounded-lg px-4 py-2 bg-purple-900 text-white"
                            >
                                Delete Task
                            </button>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Logistic Status Modal */}
            <Modal
                isOpen={isLogisticStatusModalOpen}
                onClose={() => {
                    setLogisticStatusModalOpen(false);
                    setSelectedLogisticTaskForStatus(null);
                }}
                title="Change Logistic Status"
            >
                <form onSubmit={handleLogisticStatusSubmit} className="space-y-4 text-black">
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            name="status"
                            defaultValue={
                                selectedLogisticTaskForStatus
                                    ? selectedLogisticTaskForStatus.logistic_status
                                    : "Pending"
                            }
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-purple-900 rounded-lg px-4 py-2 text-white">
                        Update Status
                    </button>
                </form>
            </Modal>
        </div>
        </Suspense>
    );
}
