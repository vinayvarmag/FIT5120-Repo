"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import Modal from "../../components/Modal"; // Import your Modal component

export default function CulturalEventPlanner() {
    const router = useRouter();

    // Static Event and Calendar Data
    const [currentYear, setCurrentYear] = useState(2025);
    const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
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
    const eventDate = { year: 2025, month: 3, day: 10 };

    // Participants, Agenda, and Logistics State
    const [participants, setParticipants] = useState([
        { id: 1, name: "Emily Thompson", role: "Teacher", ethnicity: "European", status: "Confirmed" },
        { id: 2, name: "Michael Anderson", role: "Guest Speaker", ethnicity: "Asian", status: "Pending" },
    ]);
    const [agendaItems, setAgendaItems] = useState([]);
    const [logisticTasks, setLogisticTasks] = useState([]);

    // Modal state flags
    const [isParticipantModalOpen, setParticipantModalOpen] = useState(false);
    const [isAgendaModalOpen, setAgendaModalOpen] = useState(false);
    const [isLogisticModalOpen, setLogisticModalOpen] = useState(false);

    // Form state for modals
    const [newParticipant, setNewParticipant] = useState({ name: "", role: "", ethnicity: "" });
    const [newAgendaItem, setNewAgendaItem] = useState({ time: "", title: "", description: "" });
    const [newLogisticTask, setNewLogisticTask] = useState({ title: "", description: "" });

    // Handlers for modal form submissions
    const handleParticipantSubmit = (e) => {
        e.preventDefault();
        const id = participants.length + 1;
        setParticipants([...participants, { id, ...newParticipant, status: "Pending" }]);
        setNewParticipant({ name: "", role: "", ethnicity: "" });
        setParticipantModalOpen(false);
    };

    const handleAgendaSubmit = (e) => {
        e.preventDefault();
        const id = agendaItems.length + 1;
        setAgendaItems([...agendaItems, { id, ...newAgendaItem }]);
        setNewAgendaItem({ time: "", title: "", description: "" });
        setAgendaModalOpen(false);
    };

    const handleLogisticSubmit = (e) => {
        e.preventDefault();
        const id = logisticTasks.length + 1;
        setLogisticTasks([...logisticTasks, { id, ...newLogisticTask, completed: false }]);
        setNewLogisticTask({ title: "", description: "" });
        setLogisticModalOpen(false);
    };

    // Toggle function for logistic tasks (checklist)
    const toggleLogisticTask = (id) => {
        setLogisticTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    // Static Financial Overview data (handled on finance page for detailed view)
    const totalBudget = 125000;
    const currentExpenses = 78000;
    const remainingBudget = totalBudget - currentExpenses;
    const budgetUsedPercent = ((currentExpenses / totalBudget) * 100).toFixed(0);

    return (
        <div className="bg-gray-50 min-h-screen text-black">
            {/* NAVIGATION */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-[Pacifico] text-2xl text-primary text-black">logo</span>
                            <div className="ml-10 flex space-x-8">
                                <a href="#" className="hover:text-primary px-3 py-2 text-sm font-medium text-black">Dashboard</a>
                                <a href="#" className="text-primary border-b-2 border-primary px-3 py-2 text-sm font-medium text-black">Events</a>
                                <a href="#" className="hover:text-primary px-3 py-2 text-sm font-medium text-black">Resources</a>
                                <a href="#" className="hover:text-primary px-3 py-2 text-sm font-medium text-black">Settings</a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                id="createEventBtn"
                                className="!rounded-button bg-primary px-3 py-1.5 text-sm font-medium hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap text-black"
                            >
                                <i className="ri-add-line mr-2" />
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-black">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black">Cultural Exchange Event Planner</h1>
                    <p className="mt-2 text-sm text-black">Plan and manage your cultural exchange events efficiently</p>
                </div>

                <div className="grid grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="col-span-2">
                        {/* Event Details */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Event Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                        placeholder="Enter event title"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-1">End Time</label>
                                            <input
                                                type="time"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Location</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                            placeholder="Enter location"
                                        />
                                        <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Description</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-32 text-black"
                                        placeholder="Enter event description"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Participants */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Participants</h2>
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative flex-1 max-w-xs">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                        placeholder="Search participants"
                                    />
                                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                                </div>
                                <button
                                    onClick={() => setParticipantModalOpen(true)}
                                    className="!rounded-button bg-primary text-black px-3 py-1.5 text-sm font-medium hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap ml-4"
                                >
                                    <i className="ri-user-add-line mr-2" />
                                    Add Participant
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Ethnicity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {participants.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{p.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{p.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{p.ethnicity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{p.status}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Event Agenda */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Event Agenda</h2>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-black">Schedule Overview</h3>
                                <button
                                    onClick={() => setAgendaModalOpen(true)}
                                    className="!rounded-button text-primary hover:bg-primary/5 px-3 py-1.5 text-sm font-medium flex items-center cursor-pointer whitespace-nowrap border border-primary/20 text-black"
                                >
                                    <i className="ri-add-line mr-2" />
                                    Add Agenda Item
                                </button>
                            </div>
                            <div>
                                {agendaItems.length === 0 ? (
                                    <p className="text-sm text-black">No agenda items added.</p>
                                ) : (
                                    <ul className="list-disc pl-5">
                                        {agendaItems.map((item) => (
                                            <li key={item.id} className="mb-2 text-black">
                                                <strong>{item.time}</strong> - {item.title}: {item.description}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Logistics Checklist moved under Event Agenda */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Logistics Checklist</h2>
                            <div className="space-y-4">
                                {logisticTasks.length === 0 ? (
                                    <p className="text-sm text-black">No tasks added.</p>
                                ) : (
                                    logisticTasks.map((task) => (
                                        <div key={task.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleLogisticTask(task.id)}
                                                className="h-4 w-4 text-primary border-gray-300 rounded"
                                            />
                                            <span className={`${task.completed ? "line-through text-gray-500" : "text-black"}`}>
                        {task.title}: {task.description}
                      </span>
                                        </div>
                                    ))
                                )}
                                <button
                                    onClick={() => setLogisticModalOpen(true)}
                                    className="!rounded-button text-primary hover:bg-primary/5 px-3 py-1.5 text-sm font-medium flex items-center cursor-pointer whitespace-nowrap w-full justify-center border border-primary/20 text-black"
                                >
                                    <i className="ri-add-line mr-2" />
                                    Add Task
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8 text-black">
                        {/* Calendar */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Calendar</h2>
                            <div className="space-y-4">
                                <div id="calendar" className="w-full mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <button onClick={handlePrevMonth} className="hover:text-primary text-black">
                                            <i className="ri-arrow-left-s-line ri-lg" />
                                        </button>
                                        <h3 id="currentMonth" className="text-lg font-medium text-black">
                                            {monthNames[currentMonth]} {currentYear}
                                        </h3>
                                        <button onClick={handleNextMonth} className="hover:text-primary text-black">
                                            <i className="ri-arrow-right-s-line ri-lg" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                            <div key={day} className="text-xs font-medium text-black">{day}</div>
                                        ))}
                                    </div>
                                    <div id="calendarDays" className="grid grid-cols-7 gap-1">
                                        {[...Array(firstDayOfMonth)].map((_, idx) => (
                                            <div key={`empty-${idx}`} className="h-10 text-center text-sm text-black"></div>
                                        ))}
                                        {[...Array(daysInMonth)].map((_, idx) => {
                                            const dayNum = idx + 1;
                                            const isEventDate =
                                                currentYear === eventDate.year &&
                                                currentMonth === eventDate.month &&
                                                dayNum === eventDate.day;
                                            return (
                                                <div
                                                    key={`day-${dayNum}`}
                                                    className={`h-10 flex items-center justify-center text-sm rounded-full cursor-pointer hover:bg-gray-100 ${
                                                        isEventDate
                                                            ? "bg-primary text-white hover:bg-primary/90"
                                                            : "text-black"
                                                    }`}
                                                >
                                                    {dayNum}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <a
                                        href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cultural%20Exchange%20Event&dates=20250410T090000Z/20250410T120000Z&details=Join%20us%20for%20a%20cultural%20exchange%20event&location=Event%20Location"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="!rounded-button bg-blue-500 px-3 py-1.5 text-sm font-medium hover:bg-blue-600 flex items-center cursor-pointer whitespace-nowrap text-black"
                                    >
                                        <i className="ri-google-fill mr-2" />
                                        Add to Google Calendar
                                    </a>
                                    <a
                                        href="data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20250410T090000Z%0ADTEND:20250410T120000Z%0ASUMMARY:Cultural%20Exchange%20Event%0ADESCRIPTION:Join%20us%20for%20a%20cultural%20exchange%20event%0ALOCATION:Event%20Location%0AEND:VEVENT%0AEND:VCALENDAR"
                                        download="cultural_exchange_event.ics"
                                        className="!rounded-button bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap text-black"
                                    >
                                        <i className="ri-apple-fill mr-2" />
                                        Add to Apple Calendar
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Reminder */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Reminder</h2>
                            <div className="space-y-4">
                                <p className="text-sm text-black">
                                    Automated reminders can be scheduled to notify participants of upcoming events.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">Remind me in</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                                        placeholder="48h Before the Event"
                                    />
                                </div>
                                <button className="!rounded-button bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap text-black">
                                    Schedule Reminder
                                </button>
                            </div>
                        </div>

                        {/* Financial Overview Section */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8 text-black">
                            <h2 className="text-xl font-semibold mb-4 text-black">Financial Overview</h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium text-black mb-2">Total Budget</h3>
                                    <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium text-black mb-2">Current Expenses</h3>
                                    <p className="text-2xl font-bold">${currentExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 text-black">
                                    <h3 className="text-sm font-medium text-black mb-2">Budget Remaining</h3>
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

            {/* POPUP MODALS */}

            {/* Add New Participant Modal */}
            <Modal
                isOpen={isParticipantModalOpen}
                onClose={() => setParticipantModalOpen(false)}
                title="Add New Participant"
            >
                <form onSubmit={handleParticipantSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Role"
                        value={newParticipant.role}
                        onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Ethnicity"
                        value={newParticipant.ethnicity}
                        onChange={(e) => setNewParticipant({ ...newParticipant, ethnicity: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        Save Participant
                    </button>
                </form>
            </Modal>

            {/* Add Agenda Item Modal */}
            <Modal
                isOpen={isAgendaModalOpen}
                onClose={() => setAgendaModalOpen(false)}
                title="Add Agenda Item"
            >
                <form onSubmit={handleAgendaSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Time (e.g., 09:00 - 09:30)"
                        value={newAgendaItem.time}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, time: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        value={newAgendaItem.title}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newAgendaItem.description}
                        onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        Save Agenda Item
                    </button>
                </form>
            </Modal>

            {/* Add Logistic Task Modal */}
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
                        onChange={(e) => setNewLogisticTask({ ...newLogisticTask, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <textarea
                        placeholder="Task Description"
                        value={newLogisticTask.description}
                        onChange={(e) => setNewLogisticTask({ ...newLogisticTask, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        Save Task
                    </button>
                </form>
            </Modal>
        </div>
    );
}
