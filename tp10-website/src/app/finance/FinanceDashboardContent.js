/* File: src/app/finance/FinanceDashboardContent.js */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import DonutChart from "@/components/DonutChart";
import LineChart  from "@/components/LineChart";
import Modal      from "@/components/Modal";

/* ─── helpers ──────────────────────────────────────────────────────────── */
const dateOpts = { day: "2-digit", month: "short", year: "numeric" };
const fmtDate  = (d) =>
    d ? new Date(d).toLocaleDateString("en-AU", dateOpts) : "-";
const fmtCash  = (n) => `$${Number(n || 0).toLocaleString("en-AU")}`;

/* ======================================================================= */
export default function FinanceDashboardContent() {
    const searchParams   = useSearchParams();
    const router         = useRouter();
    const queryEventId   = searchParams.get("event_id");
    const eventId        = queryEventId ? Number(queryEventId) : null;

    /* ─── core state ─────────────────────────────────────────────────────── */
    const [events,         setEvents]         = useState([]);
    const [eventData,      setEventData]      = useState(null);
    const [expenses,       setExpenses]       = useState([]);
    const [categories,     setCategories]     = useState([]);
    const [selectedTitle,  setSelectedTitle]  = useState("");

    /* ─── UI + edit state ────────────────────────────────────────────────── */
    const [isBudgetOpen,   setBudgetOpen]     = useState(false);
    const [isExpenseOpen,  setExpenseOpen]    = useState(false);
    const [isSaving,       setIsSaving]       = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);

    /* ─── forms ──────────────────────────────────────────────────────────── */
    const today        = new Date().toISOString().substring(0, 10);
    const emptyExpense = {
        categoryId:  "",
        title:       "",
        amount:      "",
        description: "",
        date:        today,
    };
    const [expenseForm, setExpenseForm] = useState(emptyExpense);
    const [budgetInput, setBudgetInput] = useState("");

    /* ══════════════════ INITIAL LOADS (events, categories) ════════════════ */
    useEffect(() => {
        /* all events for dropdown */
        (async () => {
            const res = await fetch("/api/event");
            if (res.ok) setEvents(await res.json());
        })().catch(console.error);

        /* categories */
        (async () => {
            const res = await fetch("/api/categories");
            if (res.ok) setCategories(await res.json());
        })().catch(console.error);
    }, []);

    /* ══════════════════ LOAD SINGLE EVENT + EXPENSES ON ID ════════════════ */
    useEffect(() => {
        if (!eventId) {
            setEventData(null);
            setExpenses([]);
            setSelectedTitle("");
            return;
        }
        (async () => {
            const evRes = await fetch(`/api/event?event_id=${eventId}`);
            const [ev]  = await evRes.json();
            setEventData(ev);
            setSelectedTitle(ev.event_title);
            setBudgetInput(ev.event_budget || "");

            const exRes = await fetch(`/api/expense?event_id=${eventId}`);
            setExpenses(await exRes.json());
        })().catch(console.error);
    }, [eventId]);

    /* ══════════════════ EVENT CHANGER (dropdown) ══════════════════════════ */
    const changeEvent = (e) => {
        const newId = e.target.value;
        if (newId) router.push(`?event_id=${newId}`);
        else       router.push(".");              // clear query to show “select event”
    };

    /* ══════════════════ EXPENSE CRUD ══════════════════════════════════════ */
    const openNewExpense = () => {
        setEditingExpenseId(null);
        setExpenseForm(emptyExpense);
        setExpenseOpen(true);
    };

    const handleEditExpense = (exp) => {
        const cat = categories.find((c) => c.category === exp.category);
        setEditingExpenseId(exp.expense_id);
        setExpenseForm({
            categoryId:  cat ? cat.id : "",
            title:       exp.title,
            amount:      exp.amount,
            description: exp.description,
            date:        exp.date ? exp.date.substring(0, 10) : today,
        });
        setExpenseOpen(true);
    };

    const saveExpense = async () => {
        if (!eventId) return;
        if (!expenseForm.title || !expenseForm.amount || !expenseForm.categoryId) {
            alert("Please fill title, amount & category"); return;
        }
        setIsSaving(true);
        try {
            let url    = "/api/expense";
            let method = "POST";
            let body   = {};

            if (editingExpenseId) {
                url    = `/api/expense?expense_id=${editingExpenseId}`;
                method = "PUT";
                body   = { ...expenseForm };
            } else {
                body   = { ...expenseForm, event_id: eventId };
            }

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const exRes = await fetch(`/api/expense?event_id=${eventId}`);
            setExpenses(await exRes.json());
            setExpenseOpen(false);
            setEditingExpenseId(null);
            setExpenseForm(emptyExpense);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteExpense = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await fetch(`/api/expense?expense_id=${id}`, { method: "DELETE" });
            setExpenses((p) => p.filter((e) => e.expense_id !== id));
        } catch (err) {
            console.error(err);
        }
    };



    /* ══════════════════ DERIVED NUMBERS ═══════════════════════════════════ */
    const totalBudget     = Number(eventData?.event_budget) || 0;
    const currentExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const remainingBudget = totalBudget - currentExpenses;

    /* ────────────────────────── RENDER ─────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50 pt-20 p-6 text-black">
            {/* ─── header ─── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Event Finance Dashboard</h1>
                    <p className="text-sm">Track and manage your event expenses</p>
                </div>

                {/* dropdown selector */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium" htmlFor="eventSelect">
                        Select&nbsp;Event:
                    </label>
                    <select
                        id="eventSelect"
                        value={eventId || ""}
                        onChange={changeEvent}
                        className="border rounded-lg px-3 py-1.5 text-sm bg-white min-w-[12rem]"
                    >
                        <option value="">-- choose --</option>
                        {events.map((ev) => (
                            <option key={ev.event_id} value={ev.event_id}>
                                {ev.event_title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {eventId ? (
                <>
                    {/* ─── stat cards ─── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <StatCard title="Total Budget Allocation" value={fmtCash(totalBudget)} />
                        <StatCard
                            title="Current Expenses"
                            value={fmtCash(currentExpenses)}
                            subtitle={
                                totalBudget
                                    ? `${((currentExpenses / totalBudget) * 100).toFixed(1)}% used`
                                    : ""
                            }
                        />
                        <StatCard
                            title="Budget Remaining"
                            value={fmtCash(remainingBudget)}
                            subtitle={
                                totalBudget
                                    ? `${((remainingBudget / totalBudget) * 100).toFixed(1)}% left`
                                    : ""
                            }
                        />
                    </div>

                    {/* ─── charts ─── */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold mb-2">Expense Breakdown</h2>
                            <DonutChart expenseItems={expenses} />
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                            <h2 className="text-lg font-semibold mb-2">Spending Over Time</h2>
                            <LineChart expenseItems={expenses} />
                        </div>
                    </div>

                    {/* ─── expense table ─── */}
                    <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Expenses</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={openNewExpense}
                                    className="bg-purple-900 text-white rounded-lg px-3 py-1.5 text-sm"
                                >
                                    + Add Expense
                                </button>
                            </div>
                        </div>

                        <table className="min-w-full">
                            <thead className="sticky top-0 bg-white z-10">
                            <tr className="text-left text-xs border-b border-gray-200">
                                <th className="py-2 px-2">Category</th>
                                <th className="py-2 px-2">Title</th>
                                <th className="py-2 px-4 whitespace-nowrap">Amount</th>
                                <th className="py-2 px-4 whitespace-nowrap">Date</th>
                                <th className="py-2 px-2">Description</th>
                                <th className="py-2 px-2">Actions</th>
                            </tr>
                            </thead>

                            <tbody className="text-sm">
                            {expenses.map((e) => (
                                <tr key={e.expense_id} className="border-b border-gray-100">
                                    <td className="py-3 max-w-[10rem] truncate">{e.category}</td>
                                    <td className="py-3 max-w-[12rem] truncate">{e.title}</td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {fmtCash(e.amount)}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        {fmtDate(e.date)}
                                    </td>
                                    <td className="py-3 max-w-[14rem] truncate">{e.description}</td>
                                    <td className="py-3">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditExpense(e)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteExpense(e.expense_id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-500">
                                        No expenses recorded yet.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-600 mt-20">
                    Choose an event from the dropdown to see its finances.
                </p>
            )}

            {/* ══════════════════ MODALS (budget & expense) ══════════════════════ */}

            {/* ─── EXPENSE ADD/EDIT ─── */}
            <Modal
                isOpen={isExpenseOpen}
                onClose={() => setExpenseOpen(false)}
                title={editingExpenseId ? "Edit Expense" : "Add Expense"}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isSaving) saveExpense();
                    }}
                    className="space-y-4"
                >
                    {/* category */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={expenseForm.categoryId}
                            onChange={(e) =>
                                setExpenseForm((p) => ({ ...p, categoryId: e.target.value }))
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        >
                            <option value="">Select...</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={expenseForm.title}
                            onChange={(e) =>
                                setExpenseForm((p) => ({ ...p, title: e.target.value }))
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            required
                        />
                    </div>

                    {/* amount & date */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                                Amount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={expenseForm.amount}
                                onChange={(e) =>
                                    setExpenseForm((p) => ({ ...p, amount: e.target.value }))
                                }
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) =>
                                    setExpenseForm((p) => ({ ...p, date: e.target.value }))
                                }
                                className="border rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Description
                        </label>
                        <textarea
                            value={expenseForm.description}
                            onChange={(e) =>
                                setExpenseForm((p) => ({ ...p, description: e.target.value }))
                            }
                            className="w-full border rounded-lg px-3 py-2"
                            rows={3}
                        />
                    </div>

                    {/* buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setExpenseOpen(false)}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-purple-900 text-white text-sm disabled:opacity-60"
                        >
                            {isSaving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ─── BUDGET SET ─── */}

        </div>
    );
}

/* ─── small stat card ─────────────────────────────────────────────────── */
function StatCard({ title, value, subtitle }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
        </div>
    );
}
