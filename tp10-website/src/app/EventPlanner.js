"use client";
import React, { useEffect } from "react";
// Import your global Tailwind CSS here if not already imported
// import "../styles/globals.css";
import "remixicon/fonts/remixicon.css";

// If you want to make use of jsPDF, you can also import it directly:
// import jsPDF from "jspdf";
// or keep using the window object inside useEffect if you prefer.

export default function CulturalEventPlanner() {
    useEffect(() => {
        // -----------------------------
        // Wrap your original <script> code inside this effect
        // so it only runs on the client side and after render.
        // -----------------------------

        // If you reference window or document,
        // wrap in a condition to avoid SSR errors:
        if (typeof window === "undefined") return;

        const { jsPDF } = window.jspdf || {};

        // 1) "Create Event" modal
        const createEventBtn = document.getElementById("createEventBtn");
        if (createEventBtn) {
            createEventBtn.addEventListener("click", function () {
                const modal = document.createElement("div");
                modal.className =
                    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                modal.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">Create New Event</h3>
            <p class="text-gray-600 mb-4">Start planning your new cultural exchange event</p>
            <div class="flex justify-end space-x-4">
              <button class="!rounded-button px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100" onclick="this.closest('.fixed').remove()">Cancel</button>
              <button class="!rounded-button bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary/90">Continue</button>
            </div>
          </div>`;
                document.body.appendChild(modal);
            });
        }

        // 2) Expense item click -> expense details modal
        document.addEventListener("click", function (e) {
            const expenseItem = e.target.closest(".expense-item");
            if (!expenseItem) return;

            const category = expenseItem.querySelector(".w-24 span").textContent;
            const title = expenseItem.querySelector("h4").textContent;
            const description = expenseItem.querySelector("p").textContent;
            const amount = expenseItem.querySelector(".w-20 span").textContent;
            const modal = document.getElementById("expenseDetailsModal");
            const modalContent = document.getElementById("expenseModalContent");
            const modalTitle = document.getElementById("expenseModalTitle");

            if (!modal || !modalContent || !modalTitle) return;

            modalTitle.textContent = title;
            modalContent.innerHTML = `
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-medium text-gray-700">Category</span>
            <span class="text-sm font-medium text-gray-900">${category}</span>
          </div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-medium text-gray-700">Amount</span>
            <span class="text-sm font-medium text-gray-900">${amount}</span>
          </div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">Description</span>
            <p class="text-sm text-gray-600 mt-1">${description}</p>
          </div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">Date Added</span>
            <p class="text-sm text-gray-600 mt-1">April 3, 2025</p>
          </div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">Payment Method</span>
            <p class="text-sm text-gray-600 mt-1">Credit Card</p>
          </div>
          <div class="mb-3">
            <span class="text-sm font-medium text-gray-700">Receipt</span>
            <p class="text-sm text-gray-600 mt-1 flex items-center">
              <i class="ri-file-pdf-line mr-2 text-red-500"></i>
              <a href="#" class="text-primary hover:underline">View Receipt</a>
            </p>
          </div>
        </div>
      `;
            modal.classList.remove("hidden");

            // Close modal
            const closeBtn = document.getElementById("closeExpenseModal");
            const closeBtnFooter = document.getElementById("closeExpenseModalBtn");
            const closeModal = () => modal.classList.add("hidden");
            if (closeBtn) closeBtn.addEventListener("click", closeModal);
            if (closeBtnFooter) closeBtnFooter.addEventListener("click", closeModal);

            // Edit
            const editBtn = document.getElementById("editExpenseBtn");
            if (editBtn) {
                editBtn.addEventListener("click", function () {
                    const editModal = document.createElement("div");
                    editModal.className =
                        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                    editModal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 class="text-lg font-semibold mb-4">Edit Expense</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="${category}" selected>${category}</option>
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value="${title}">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input type="number" step="0.01" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" value="${amount.replace(
                        "$",
                        ""
                    )}">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-20">${description}</textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="Credit Card" selected>Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="PayPal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                  <div class="flex items-center">
                    <span class="text-sm text-gray-600 mr-2">Current: receipt.pdf</span>
                    <label class="!rounded-button bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap">
                      <i class="ri-upload-2-line mr-2"></i>
                      Change
                      <input type="file" class="hidden">
                    </label>
                  </div>
                </div>
              </div>
              <div class="flex justify-end space-x-4 mt-6">
                <button class="!rounded-button px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100" onclick="this.closest('.fixed').remove()">Cancel</button>
                <button class="!rounded-button bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary/90" onclick="this.closest('.fixed').remove()">Save Changes</button>
              </div>
            </div>`;
                    document.body.appendChild(editModal);
                    modal.classList.add("hidden");
                });
            }
        });

        // 3) Render calendar, agenda logic, etc.
        // The original script is large, so copy your relevant sections (calendar rendering, “Add Agenda Item” modals, etc.)
        // For brevity here, I’ll show an example with the main functions:

        // Example: Agenda printing logic with jsPDF
        const printAgendaBtn = document.getElementById("printAgendaBtn");
        if (printAgendaBtn && jsPDF) {
            printAgendaBtn.addEventListener("click", function () {
                const doc = new jsPDF();
                // ... replicate your existing printing logic ...
                doc.save("event_agenda.pdf");
            });
        }

        // Example: Generating overall PDF
        function generatePDF() {
            if (!jsPDF) return;
            const doc = new jsPDF();
            // ... replicate your existing generatePDF logic ...
            doc.save("event.pdf");
        }
        const actionArea = document.querySelector(".col-span-2");
        if (actionArea) {
            // If you want to re-append a "Generate PDF" button:
            // Or you might already have it in the JSX below
            // ...
        }
    }, []);

    // -----------------------------
    // Return JSX that mirrors the HTML structure,
    // replacing `class` with `className`,
    // and converting any inline onclick= to React onClick={...} if needed.
    // For a direct port, you can keep them as placeholders
    // and let the useEffect scripts attach the listeners.
    // -----------------------------
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* --- NAV --- */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-[Pacifico] text-2xl text-primary">logo</span>
                            <div className="ml-10 flex space-x-8">
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                                >
                                    Dashboard
                                </a>
                                <a
                                    href="#"
                                    className="text-primary border-b-2 border-primary px-3 py-2 text-sm font-medium"
                                >
                                    Events
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                                >
                                    Resources
                                </a>
                                <a
                                    href="#"
                                    className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                                >
                                    Settings
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                id="createEventBtn"
                                className="!rounded-button bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap"
                            >
                                <i className="ri-add-line mr-2" />
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* --- MAIN CONTENT --- */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Cultural Exchange Event Planner
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Plan and manage your cultural exchange events efficiently
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {/* Left column (Event details, Participants, Agenda) */}
                    <div className="col-span-2">
                        {/* Event Details */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Enter event title"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            placeholder="Enter location"
                                        />
                                        <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-32"
                                        placeholder="Enter event description"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Participants */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Participants</h2>
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative flex-1 max-w-xs">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Search participants"
                                    />
                                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <button className="!rounded-button bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary/90 flex items-center cursor-pointer whitespace-nowrap ml-4">
                                    <i className="ri-user-add-line mr-2" />
                                    Add Participant
                                </button>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ethnicity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Emily Thompson
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Teacher
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="relative">
                                                <button
                                                    id="ethnicity-dropdown-1"
                                                    className="text-gray-700 border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center justify-between w-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                >
                                                    <span>European</span>
                                                    <i className="ri-arrow-down-s-line ml-2" />
                                                </button>
                                                <div
                                                    id="ethnicity-options-1"
                                                    className="hidden absolute z-10 mt-1 w-32 bg-white shadow-lg rounded-lg py-1 text-sm"
                                                >
                                                    {/* Ethnicity dropdown items */}
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        European
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Asian
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        African
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Hispanic
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Middle Eastern
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Pacific Islander
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Indigenous
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Other
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <i className="ri-more-2-fill" />
                                            </button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Michael Anderson
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Guest Speaker
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="relative">
                                                <button
                                                    id="ethnicity-dropdown-2"
                                                    className="text-gray-700 border border-gray-300 rounded-lg px-3 py-1 text-sm flex items-center justify-between w-32 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                >
                                                    <span>Asian</span>
                                                    <i className="ri-arrow-down-s-line ml-2" />
                                                </button>
                                                <div
                                                    id="ethnicity-options-2"
                                                    className="hidden absolute z-10 mt-1 w-32 bg-white shadow-lg rounded-lg py-1 text-sm"
                                                >
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        European
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Asian
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        African
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Hispanic
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Middle Eastern
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Pacific Islander
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Indigenous
                                                    </div>
                                                    <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                                        Other
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <i className="ri-more-2-fill" />
                                            </button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Event Agenda */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Event Agenda</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Schedule Overview
                                    </h3>
                                    <button
                                        id="addAgendaItemBtn"
                                        className="!rounded-button text-primary hover:bg-primary/5 px-3 py-1.5 text-sm font-medium flex items-center cursor-pointer whitespace-nowrap border border-primary/20"
                                    >
                                        <i className="ri-add-line mr-2" />
                                        Add Agenda Item
                                    </button>
                                </div>
                                <div id="agendaItems" className="space-y-3">
                                    {/* Hard-coded agenda items go here; dynamically appended items, too */}
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-start">
                                        <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        09:00 - 09:30
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Registration &amp; Welcome Coffee
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Lobby area, name tags distribution
                                            </p>
                                        </div>
                                        <div className="w-20 text-right">
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <i className="ri-more-2-fill" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* ... etc. */}
                                </div>
                                <div className="mt-4">
                                    <button
                                        id="printAgendaBtn"
                                        className="!rounded-button bg-gray-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap w-full justify-center"
                                    >
                                        <i className="ri-printer-line mr-2" />
                                        Print Agenda
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Right column (Calendar, Reminder, Checklist, Finance) */}
                    <div className="space-y-8">
                        {/* Expense details modal */}
                        <div
                            id="expenseDetailsModal"
                            className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold" id="expenseModalTitle">
                                        Expense Details
                                    </h3>
                                    <button
                                        className="text-gray-400 hover:text-gray-500"
                                        id="closeExpenseModal"
                                    >
                                        <i className="ri-close-line ri-lg" />
                                    </button>
                                </div>
                                <div id="expenseModalContent" className="space-y-4">
                                    {/* Populated dynamically */}
                                </div>
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        className="!rounded-button px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        id="closeExpenseModalBtn"
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="!rounded-button bg-primary text-white px-3 py-1.5 text-sm font-medium hover:bg-primary/90"
                                        id="editExpenseBtn"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Calendar */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
                            <div className="space-y-4">
                                <div id="calendar" className="w-full mb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <button
                                            id="prevMonth"
                                            className="text-gray-600 hover:text-primary"
                                        >
                                            <i className="ri-arrow-left-s-line ri-lg" />
                                        </button>
                                        <h3
                                            id="currentMonth"
                                            className="text-lg font-medium"
                                        >
                                            April 2025
                                        </h3>
                                        <button
                                            id="nextMonth"
                                            className="text-gray-600 hover:text-primary"
                                        >
                                            <i className="ri-arrow-right-s-line ri-lg" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        <div className="text-xs font-medium text-gray-500">Sun</div>
                                        <div className="text-xs font-medium text-gray-500">Mon</div>
                                        <div className="text-xs font-medium text-gray-500">Tue</div>
                                        <div className="text-xs font-medium text-gray-500">Wed</div>
                                        <div className="text-xs font-medium text-gray-500">Thu</div>
                                        <div className="text-xs font-medium text-gray-500">Fri</div>
                                        <div className="text-xs font-medium text-gray-500">Sat</div>
                                    </div>
                                    <div id="calendarDays" className="grid grid-cols-7 gap-1">
                                        {/* Calendar days inserted by script */}
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4">
                                    <a
                                        href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cultural%20Exchange%20Event&dates=20250410T090000Z/20250410T120000Z&details=Join%20us%20for%20a%20cultural%20exchange%20event&location=Event%20Location"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="!rounded-button bg-blue-500 text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-600 flex items-center cursor-pointer whitespace-nowrap"
                                    >
                                        <i className="ri-google-fill mr-2" />
                                        Add to Google Calendar
                                    </a>
                                    <a
                                        href="data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:20250410T090000Z%0ADTEND:20250410T120000Z%0ASUMMARY:Cultural%20Exchange%20Event%0ADESCRIPTION:Join%20us%20for%20a%20cultural%20exchange%20event%0ALOCATION:Event%20Location%0AEND:VEVENT%0AEND:VCALENDAR"
                                        download="cultural_exchange_event.ics"
                                        className="!rounded-button bg-gray-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap"
                                    >
                                        <i className="ri-apple-fill mr-2" />
                                        Add to Apple Calendar
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* Reminder */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Reminder</h2>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700">
                                    Automated reminders can be scheduled to notify participants of
                                    upcoming events.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remind me in
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="48h Before the Event"
                                    />
                                </div>
                                <button className="!rounded-button bg-gray-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap">
                                    Schedule Reminder
                                </button>
                            </div>
                        </div>
                        {/* Logistics Checklist */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Logistics Checklist</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                    Prepare venue decorations
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                    Arrange catering service
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                    Send invitations
                  </span>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                    Prepare presentation materials
                  </span>
                                </div>
                                <button className="!rounded-button text-primary hover:bg-primary/5 px-3 py-1.5 text-sm font-medium flex items-center cursor-pointer whitespace-nowrap w-full justify-center border border-primary/20">
                                    <i className="ri-add-line mr-2" />
                                    Add Task
                                </button>
                            </div>
                        </div>
                        {/* Finance Management */}
                        <div className="bg-white shadow rounded-lg p-6 mt-8">
                            <h2 className="text-xl font-semibold mb-4">Finance Management</h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Budget Overview
                                    </h3>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-600">Total Budget</span>
                                        <span className="text-sm font-medium text-gray-900">
                      $5,000.00
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-600">Expenses</span>
                                        <span className="text-sm font-medium text-gray-900">
                      $1,850.00
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-600">Remaining</span>
                                        <span className="text-sm font-medium text-gray-900">
                      $3,150.00
                    </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 bg-primary rounded-full"
                                            style={{ width: "37%" }}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-3">
                    <span className="text-xs text-gray-500">
                      37% of budget used
                    </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Expense Tracking
                                    </h3>
                                    <button
                                        id="addExpenseBtn"
                                        className="!rounded-button text-primary hover:bg-primary/5 px-3 py-1.5 text-sm font-medium flex items-center cursor-pointer whitespace-nowrap border border-primary/20"
                                    >
                                        <i className="ri-add-line mr-2" />
                                        Add Expense
                                    </button>
                                </div>
                                <div id="expenseItems" className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-3 flex items-start expense-item cursor-pointer hover:bg-gray-100">
                                        <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        Venue
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Conference Hall Rental
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Booking fee for main venue including A/V equipment
                                            </p>
                                        </div>
                                        <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        $800.00
                      </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 flex items-start expense-item cursor-pointer hover:bg-gray-100">
                                        <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        Catering
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                International Lunch Buffet
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Food and beverages for 50 participants
                                            </p>
                                        </div>
                                        <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        $650.00
                      </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 flex items-start expense-item cursor-pointer hover:bg-gray-100">
                                        <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        Decor
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Cultural Decorations
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Flags, banners, and themed decorative elements
                                            </p>
                                        </div>
                                        <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        $250.00
                      </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 flex items-start expense-item cursor-pointer hover:bg-gray-100">
                                        <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        Marketing
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                Promotional Materials
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Flyers, digital ads, and social media promotion
                                            </p>
                                        </div>
                                        <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        $150.00
                      </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        id="generateReportBtn"
                                        className="!rounded-button bg-gray-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-gray-700 flex items-center cursor-pointer whitespace-nowrap w-full justify-center"
                                    >
                                        <i className="ri-file-chart-line mr-2" />
                                        Generate Financial Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* If you still want a single "Generate PDF" button for the entire event, you can place it somewhere below */}
        </div>
    );
}
