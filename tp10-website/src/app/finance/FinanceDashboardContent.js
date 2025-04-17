// FinanceDashboardContent.js
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "remixicon/fonts/remixicon.css";
import DonutChart from "../../components/DonutChart";
import LineChart from "../../components/LineChart";
import Modal from "../../components/Modal";

export default function FinanceDashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Convert query param to a number
    const rawEventId = searchParams.get("event_id");
    const eventId = rawEventId ? Number(rawEventId) : null;

    // ------------------ State ------------------
    const [eventData, setEventData] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);

    // Modal states
    const [isBudgetDetailsModalOpen, setBudgetDetailsModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
    // For editing existing expense
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    // Form state for Add or Edit Expense
    const [newExpense, setNewExpense] = useState({
        categoryId: "",
        title: "",
        amount: "",
        description: "",
    });

    // ------------------ Load Event & Expenses & Categories ------------------
    useEffect(() => {
        if (!eventId) return;

        async function loadEventAndExpenses() {
            try {
                // Fetch event data
                const eventRes = await fetch(`/api/event?event_id=${eventId}`);
                if (!eventRes.ok) throw new Error("Failed to fetch event data");
                const [eventJson] = await eventRes.json();
                setEventData(eventJson);

                // Fetch expenses
                const expenseRes = await fetch(`/api/expense?event_id=${eventId}`);
                if (!expenseRes.ok) throw new Error("Failed to fetch expenses");
                const expenseData = await expenseRes.json();
                setExpenses(expenseData);
            } catch (err) {
                console.error("Error loading event/expenses:", err);
            }
        }
        loadEventAndExpenses();
    }, [eventId]);

    useEffect(() => {
        async function loadCategories() {
            try {
                const catRes = await fetch(`/api/categories`);
                if (!catRes.ok) throw new Error("Failed to fetch categories");
                const catData = await catRes.json();
                setCategories(catData);
            } catch (err) {
                console.error("Error loading categories:", err);
            }
        }
        loadCategories();
    }, []);

    // ------------------ Derived Data ------------------
    const totalBudget     = eventData?.event_budget        || 0;
    const currentExpenses = Number(eventData?.current_expenses) || 0;
    const remainingBudget = totalBudget - currentExpenses;

    // ------------------ Expense Handlers (create, update, delete) ------------------
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) {
            alert("No event selected!");
            return;
        }
        try {
            if (editingExpenseId) {
                // PUT: Update expense
                await fetch(`/api/expense?expense_id=${editingExpenseId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        categoryId: Number(newExpense.categoryId),
                        title: newExpense.title,
                        amount: Number(newExpense.amount),
                        description: newExpense.description,
                    }),
                });
            } else {
                // POST: Create expense
                await fetch(`/api/expense`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        event_id: eventId,
                        categoryId: Number(newExpense.categoryId),
                        title: newExpense.title,
                        amount: Number(newExpense.amount),
                        description: newExpense.description,
                    }),
                });
            }

            // Refresh expenses
            const expenseRes  = await fetch(`/api/expense?event_id=${eventId}`);
            const expenseData = await expenseRes.json();
            setExpenses(expenseData);

            // Re-load eventData to pick up updated current_expenses
            const eventRes2  = await fetch(`/api/event?event_id=${eventId}`);
            const [freshEv] = await eventRes2.json();
            setEventData(freshEv);

            // Reset form and close modal
            setNewExpense({ categoryId: "", title: "", amount: "", description: "" });
            setEditingExpenseId(null);
            setExpenseModalOpen(false);
        } catch (error) {
            console.error("Error creating/updating expense:", error);
        }
    };

    const handleEditExpense = (exp) => {
        setEditingExpenseId(exp.expense_id);
        const foundCat = categories.find((c) => c.category === exp.category);
        const catId    = foundCat ? foundCat.id : "";
        setNewExpense({
            categoryId: catId,
            title:      exp.title,
            amount:     exp.amount,
            description:exp.description,
        });
        setExpenseModalOpen(true);
    };

    const handleDeleteExpense = async (expense_id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await fetch(`/api/expense?expense_id=${expense_id}`, { method: "DELETE" });
            // Refresh expenses
            const expenseRes  = await fetch(`/api/expense?event_id=${eventId}`);
            const expenseData = await expenseRes.json();
            setExpenses(expenseData);

            // Re-load eventData
            const eventRes2  = await fetch(`/api/event?event_id=${eventId}`);
            const [freshEv] = await eventRes2.json();
            setEventData(freshEv);
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    };

    // ------------------ Render JSX ------------------
    return (
        <div className="min-h-screen bg-gray-50 pt-20 p-6 text-black">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Event Finance Dashboard</h1>
                    <p className="text-sm text-gray-600">Track and manage your event expenses efficiently</p>
                </div>
                <div>
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm hover:bg-gray-100">
                        <span className="font-medium text-sm">{eventData?.event_title || "No Event Selected"}</span>
                        <i className="ri-calendar-event-line text-lg" />
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Total Budget Allocation</h3>
                    <p className="text-2xl font-bold mt-1">${totalBudget.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">100% of total allocation</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Current Expenses</h3>
                    <p className="text-2xl font-bold mt-1">${currentExpenses.toLocaleString()}</p>
                    {totalBudget > 0 && (<p className="text-xs text-gray-500 mt-1">{((currentExpenses / totalBudget) * 100).toFixed(1)}% of total used</p>)}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Budget Remaining</h3>
                    <p className="text-2xl font-bold mt-1">${remainingBudget.toLocaleString()}</p>
                    {totalBudget > 0 && (<p className="text-xs text-gray-500 mt-1">{((remainingBudget / totalBudget) * 100).toFixed(1)}% of budget remaining</p>)}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-800">Budget Distribution</h3>
                        <button onClick={() => setBudgetDetailsModalOpen(true)} className="text-primary text-sm font-medium hover:underline">View Details</button>
                    </div>
                    <div className="flex items-center justify-center h-52 bg-gray-50 rounded-lg">
                        <DonutChart expenseItems={expenses} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-800">Expense Timeline</h3>
                        <div>
                            <button className="text-primary text-sm font-medium hover:underline mr-2">Monthly</button>
                            <button className="text-gray-400 text-sm font-medium hover:underline">Yearly</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-52 bg-gray-50 rounded-lg">
                        <LineChart expenseItems={expenses} />
                    </div>
                </div>
            </div>

            {/* Expense Table */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-800">Expense Items</h3>
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Search expenses..." className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                        <button onClick={() => { setEditingExpenseId(null); setNewExpense({ categoryId: "", title: "", amount: "", description: "" }); setExpenseModalOpen(true); }} className="bg-primary text-black px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90">Add Expense</button>
                    </div>
                </div>
                <table className="min-w-full">
                    <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                        <th className="py-2">Category</th>
                        <th className="py-2">Title</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Description</th>
                        <th className="py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                    {expenses.map((exp) => (
                        <tr key={exp.expense_id} className="border-b border-gray-100">
                            <td className="py-3">{exp.category}</td>
                            <td className="py-3">{exp.title}</td>
                            <td className="py-3">${Number(exp.amount).toLocaleString()}</td>
                            <td className="py-3">{exp.description}</td>
                            <td className="py-3">
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditExpense(exp)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDeleteExpense(exp.expense_id)} className="text-red-600 hover:underline">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal isOpen={isBudgetDetailsModalOpen} onClose={() => setBudgetDetailsModalOpen(false)} title="Budget Details">
                <div className="space-y-4 text-black">
                    <h4 className="text-sm font-medium">Expense Breakdown</h4>
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="py-1 text-left">Category</th>
                            <th className="py-1 text-left">Title</th>
                            <th className="py-1 text-left">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.expense_id} className="border-b">
                                <td className="py-1">{expense.category}</td>
                                <td className="py-1">{expense.title}</td>
                                <td className="py-1">${Number(expense.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            <Modal isOpen={isExpenseModalOpen} onClose={() => {setExpenseModalOpen(false); setEditingExpenseId(null); setNewExpense({ categoryId: "", title: "", amount: "", description: "" });}} title={editingExpenseId ? "Edit Expense" : "Add New Expense"}>
                <form onSubmit={handleExpenseSubmit} className="space-y-4 text-black">
                    <select value={newExpense.categoryId} onChange={(e) => setNewExpense({ ...newExpense, categoryId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" required>
                        <option value="">-- Select a Category --</option>
                        {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.category}</option>))}
                    </select>
                    <input type="text" placeholder="Title" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
                    <input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
                    <textarea placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">{editingExpenseId ? "Save Changes" : "Save Expense"}</button>
                </form>
            </Modal>
        </div>
    );
}
