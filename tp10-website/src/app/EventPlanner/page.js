"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import Modal from "../../components/Modal"; // Your Modal component
import LocationSearch from "../../components/LocationSearch";

export default function CulturalEventPlanner() {
    const router = useRouter();

    // --- Calendar Setup Using Today's Date ---
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
    const eventDate = {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    };

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

    // --- Participants, Logistic Tasks, and Location Query ---
    const [participants, setParticipants] = useState([
        {
            id: 1,
            name: "Emily Thompson",
            role: "Teacher",
            ethnicity: "European",
            status: "Confirmed",
        },
        {
            id: 2,
            name: "Michael Anderson",
            role: "Guest Speaker",
            ethnicity: "Asian",
            status: "Pending",
        },
    ]);
    const [logisticTasks, setLogisticTasks] = useState([]);
    const [locationQuery, setLocationQuery] = useState("");

    // --- Modal Flags ---
    const [isParticipantModalOpen, setParticipantModalOpen] = useState(false);
    const [isLogisticModalOpen, setLogisticModalOpen] = useState(false);
    const [isAgendaModalOpen, setAgendaModalOpen] = useState(false);

    // Detail modals:
    const [isParticipantDetailsModalOpen, setParticipantDetailsModalOpen] = useState(false);
    const [selectedParticipantDetails, setSelectedParticipantDetails] = useState(null);
    const [isAgendaDetailsModalOpen, setAgendaDetailsModalOpen] = useState(false);
    const [selectedAgendaDetails, setSelectedAgendaDetails] = useState(null);

    // --- Event Form State & Editing Mode ---
    const [eventTitle, setEventTitle] = useState("");
    const [eventDateInput, setEventDateInput] = useState("");
    const [eventStartTime, setEventStartTime] = useState("");
    const [eventEndTime, setEventEndTime] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [budget, setBudget] = useState(125000);
    const [events, setEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        if (!editingEvent) {
            const now = new Date();
            setEventDateInput(now.toISOString().split("T")[0]);
            setEventStartTime(now.toTimeString().slice(0, 5));
            const endTime = new Date(now.getTime() + 60 * 60 * 1000);
            setEventEndTime(endTime.toTimeString().slice(0, 5));
        }
    }, [editingEvent]);

    const currentExpenses = 78000;
    const remainingBudget = budget - currentExpenses;
    const budgetUsedPercent = ((currentExpenses / budget) * 100).toFixed(0);

    // --- Participant Form State & Editing Flag ---
    const [participantForm, setParticipantForm] = useState({
        name: "",
        role: "",
        ethnicity: "",
        status: "Pending",
    });
    const [editingParticipant, setEditingParticipant] = useState(null);

    // Editing status for participants now happens via modal select
    const handleParticipantSubmit = (e) => {
        e.preventDefault();
        if (editingParticipant) {
            setParticipants((prev) =>
                prev.map((p) =>
                    p.id === editingParticipant.id ? { ...p, ...participantForm } : p
                )
            );
            setEditingParticipant(null);
        } else {
            const id = participants.length + 1;
            setParticipants([...participants, { id, ...participantForm }]);
        }
        setParticipantForm({ name: "", role: "", ethnicity: "", status: "Pending" });
        setParticipantModalOpen(false);
    };

    // --- Logistic Task State ---
    const [newLogisticTask, setNewLogisticTask] = useState({
        title: "",
        description: "",
    });

    const handleLogisticSubmit = (e) => {
        e.preventDefault();
        const id = logisticTasks.length + 1;
        setLogisticTasks([
            ...logisticTasks,
            { id, ...newLogisticTask, completed: false },
        ]);
        setNewLogisticTask({ title: "", description: "" });
        setLogisticModalOpen(false);
    };

    const toggleLogisticTask = (id) => {
        setLogisticTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    // --- Agenda Items State & Modal Form ---
    const [agendaItems, setAgendaItems] = useState([]);
    const [agendaForm, setAgendaForm] = useState({
        timeframe: "",
        title: "",
        description: "",
        status: "Pending",
    });
    const [editingAgendaItem, setEditingAgendaItem] = useState(null);

    const handleAgendaSubmit = (e) => {
        e.preventDefault();
        if (editingAgendaItem) {
            setAgendaItems((prev) =>
                prev.map((item) =>
                    item.id === editingAgendaItem.id ? { ...item, ...agendaForm } : item
                )
            );
            setEditingAgendaItem(null);
        } else {
            const id = agendaItems.length + 1;
            setAgendaItems([...agendaItems, { id, ...agendaForm }]);
        }
        setAgendaForm({ timeframe: "", title: "", description: "", status: "Pending" });
        setAgendaModalOpen(false);
    };

    // --- Event Form Submit & Select ---
    const handleEventSubmit = (e) => {
        e.preventDefault();
        const eventObject = {
            id: editingEvent ? editingEvent.id : events.length + 1,
            title: eventTitle,
            date: eventDateInput,
            startTime: eventStartTime,
            endTime: eventEndTime,
            location: locationQuery,
            description: eventDescription,
            totalBudget: budget,
        };

        if (editingEvent) {
            setEvents((prev) =>
                prev.map((ev) => (ev.id === editingEvent.id ? eventObject : ev))
            );
            setEditingEvent(null);
        } else {
            setEvents([...events, eventObject]);
        }
        setEventTitle("");
        setEventDateInput("");
        setEventStartTime("");
        setEventEndTime("");
        setLocationQuery("");
        setEventDescription("");
    };

    const handleSelectEvent = (e) => {
        const eventId = parseInt(e.target.value);
        if (!isNaN(eventId)) {
            const eventToEdit = events.find((ev) => ev.id === eventId);
            if (eventToEdit) {
                setEditingEvent(eventToEdit);
                setEventTitle(eventToEdit.title);
                setEventDateInput(eventToEdit.date);
                setEventStartTime(eventToEdit.startTime);
                setEventEndTime(eventToEdit.endTime);
                setLocationQuery(eventToEdit.location);
                setEventDescription(eventToEdit.description);
                setBudget(eventToEdit.totalBudget);
            }
        } else {
            setEditingEvent(null);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen text-black relative">
            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                <header className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Cultural Event Planner</h1>
                    <div>
                        <select
                            value={editingEvent ? editingEvent.id : ""}
                            onChange={handleSelectEvent}
                            className="border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select event to edit</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.title} - {ev.date}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Event Form, Participants & Agenda */}
                    <div className="col-span-2">
                        {/* Event Form */}
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
                                <div>
                                    <label className="block text-sm font-medium mb-1">Location</label>
                                    <div className="relative">
                                        <LocationSearch
                                            value={locationQuery}
                                            onChange={(newValue) => setLocationQuery(newValue)}
                                        />
                                        <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
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
                                        value={budget}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter total budget"
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

                        {/* Participants Section */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Participants</h2>
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative flex-1 max-w-xs">
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Search participants"
                                    />
                                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingParticipant(null);
                                        setParticipantForm({ name: "", role: "", ethnicity: "", status: "Pending" });
                                        setParticipantModalOpen(true);
                                    }}
                                    className="rounded bg-primary px-3 py-1.5 text-sm font-medium flex items-center hover:bg-primary/90"
                                >
                                    <i className="ri-user-add-line mr-2" />
                                    Add Participant
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                            Ethnicity
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
                                    {participants.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                {p.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                {p.role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                {p.ethnicity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {p.status}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingParticipant(p);
                                                            setParticipantForm({
                                                                name: p.name,
                                                                role: p.role,
                                                                ethnicity: p.ethnicity,
                                                                status: p.status,
                                                            });
                                                            setParticipantModalOpen(true);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        <i className="ri-edit-line" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedParticipantDetails(p);
                                                            setParticipantDetailsModalOpen(true);
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
                            </div>
                        </div>

                        {/* Event Agenda Section */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Event Agenda</h2>
                                <button
                                    onClick={() => {
                                        setEditingAgendaItem(null);
                                        setAgendaForm({
                                            timeframe: "",
                                            title: "",
                                            description: "",
                                            status: "Pending",
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
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.timeframe}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[150px] overflow-hidden truncate">
                                                    {item.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {item.status}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingAgendaItem(item);
                                                                setAgendaForm({
                                                                    timeframe: item.timeframe,
                                                                    title: item.title,
                                                                    description: item.description,
                                                                    status: item.status,
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

                    {/* RIGHT COLUMN: Calendar, Reminder, and Financial Overview */}
                    <div className="space-y-8">
                        {/* Calendar Section */}
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

                        {/* Reminder Section */}
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
                                <button className="rounded bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center whitespace-nowrap">
                                    Schedule Reminder
                                </button>
                            </div>
                        </div>

                        {/* Financial Overview Section (Under Reminder) */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium mb-2">Total Budget</h3>
                                    <p className="text-2xl font-bold">${budget.toLocaleString()}</p>
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
                                    className="bg-primary px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap text-black"
                                >
                                    View Detailed Finance
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- POPUP MODALS --- */}

            {/* Participant Modal */}
            <Modal
                isOpen={isParticipantModalOpen}
                onClose={() => setParticipantModalOpen(false)}
                title={editingParticipant ? "Edit Participant" : "Add New Participant"}
            >
                <form onSubmit={handleParticipantSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Name"
                        value={participantForm.name}
                        onChange={(e) =>
                            setParticipantForm({ ...participantForm, name: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Role"
                        value={participantForm.role}
                        onChange={(e) =>
                            setParticipantForm({ ...participantForm, role: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Ethnicity"
                        value={participantForm.ethnicity}
                        onChange={(e) =>
                            setParticipantForm({ ...participantForm, ethnicity: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={participantForm.status}
                            onChange={(e) =>
                                setParticipantForm({ ...participantForm, status: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Declined">Declined</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        {editingParticipant ? "Update Participant" : "Save Participant"}
                    </button>
                </form>
            </Modal>

            {/* Agenda Item Modal */}
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
                            value={agendaForm.timeframe}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, timeframe: e.target.value })
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
                            value={agendaForm.title}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, title: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Enter agenda title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={agendaForm.description}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, description: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2"
                            placeholder="Enter description"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={agendaForm.status}
                            onChange={(e) =>
                                setAgendaForm({ ...agendaForm, status: e.target.value })
                            }
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Declined">Declined</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center hover:bg-primary/90"
                    >
                        {editingAgendaItem ? "Save Changes" : "Add Agenda Item"}
                    </button>
                </form>
            </Modal>

            {/* Logistic Task Modal */}
            <Modal
                isOpen={isLogisticModalOpen}
                onClose={() => setLogisticModalOpen(false)}
                title="Add Logistic Task"
            >
                <form onSubmit={handleLogisticSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={newLogisticTask.title}
                        onChange={(e) =>
                            setNewLogisticTask({ ...newLogisticTask, title: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                        required
                    />
                    <textarea
                        placeholder="Task Description"
                        value={newLogisticTask.description}
                        onChange={(e) =>
                            setNewLogisticTask({ ...newLogisticTask, description: e.target.value })
                        }
                        className="w-full border rounded-lg px-4 py-2"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        Save Task
                    </button>
                </form>
            </Modal>

            {/* Participant Details Modal */}
            <Modal
                isOpen={isParticipantDetailsModalOpen}
                onClose={() => setParticipantDetailsModalOpen(false)}
                title="Participant Details"
            >
                <div className="max-h-[400px] overflow-y-auto">
                    {selectedParticipantDetails && (
                        <div className="space-y-2 text-black">
                            <p><strong>Name:</strong> {selectedParticipantDetails.name}</p>
                            <p><strong>Role:</strong> {selectedParticipantDetails.role}</p>
                            <p><strong>Ethnicity:</strong> {selectedParticipantDetails.ethnicity}</p>
                            <p><strong>Status:</strong> {selectedParticipantDetails.status}</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Agenda Details Modal */}
            <Modal
                isOpen={isAgendaDetailsModalOpen}
                onClose={() => setAgendaDetailsModalOpen(false)}
                title="Agenda Item Details"
            >
                <div className="max-h-[400px] overflow-y-auto">
                    {selectedAgendaDetails && (
                        <div className="space-y-2 text-black">
                            <p><strong>Timeframe:</strong> {selectedAgendaDetails.timeframe}</p>
                            <p><strong>Title:</strong> {selectedAgendaDetails.title}</p>
                            <p><strong>Description:</strong> {selectedAgendaDetails.description}</p>
                            <p>
                                <strong>Status:</strong> {selectedAgendaDetails.status}
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
