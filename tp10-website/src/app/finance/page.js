"use client"; // Only needed if you're on Next.js 13+ and want client features

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // For Next.js 13 App Router
import "remixicon/fonts/remixicon.css";
import DonutChart from "../../components/DonutChart";
import LineChart from "../../components/LineChart";
import Modal from "../../components/Modal";

// Reusable Modal component


export default function FinanceDashboardPage() {
    const router = useRouter();

    // Example data for the cards
    const totalBudget = 125000;
    const currentExpenses = 78000;
    const remainingBudget = totalBudget - currentExpenses;
    const eventTitle = "Annual Tech Conference 2025";

    // Example static categories (for display in table and details modal)
    const categories = [
        { id: 1, name: "Venue Costs", allocated: 30000, actual: 25000 },
        { id: 2, name: "Catering", allocated: 20000, actual: 18000 },
        { id: 3, name: "Marketing", allocated: 15000, actual: 8000 },
        { id: 4, name: "Equipment/Technical", allocated: 20000, actual: 15000 },
        { id: 5, name: "Miscellaneous", allocated: 40000, actual: 22000 },
    ];

    // Expense items state (dynamically updated)
    const [expenseItems, setExpenseItems] = useState([
        {
            id: 1,
            category: "Venue",
            title: "Conference Hall Rental",
            amount: 800,
            description: "Booking fee for main venue including A/V equipment",
        },
        {
            id: 2,
            category: "Catering",
            title: "International Lunch Buffet",
            amount: 650,
            description: "Food and beverages for 50 participants",
        },
        {
            id: 3,
            category: "Decor",
            title: "Cultural Decorations",
            amount: 250,
            description: "Flags, banners, and themed decorative elements",
        },
        {
            id: 4,
            category: "Marketing",
            title: "Promotional Materials",
            amount: 150,
            description: "Flyers, digital ads, and social media promotion",
        },
    ]);

    // Modal states
    const [isBudgetDetailsModalOpen, setBudgetDetailsModalOpen] = useState(false);
    const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);

    // Form state for Add Expense modal
    const [newExpense, setNewExpense] = useState({
        category: "",
        title: "",
        amount: "",
        description: "",
    });

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        const id = expenseItems.length + 1;
        const expenseData = {
            id,
            category: newExpense.category,
            title: newExpense.title,
            amount: parseFloat(newExpense.amount),
            description: newExpense.description,
        };
        setExpenseItems([...expenseItems, expenseData]);
        setNewExpense({ category: "", title: "", amount: "", description: "" });
        setExpenseModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 p-6 text-black">
            {/* Top Bar / Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Event Finance Dashboard</h1>
                    <p className="text-sm text-gray-600">
                        Track and manage your event expenses efficiently
                    </p>
                </div>
                <div>
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm hover:bg-gray-100">
                        <span className="font-medium text-sm">{eventTitle}</span>
                        <i className="ri-calendar-event-line text-lg" />
                    </button>
                </div>
            </div>

            {/* Cards: Budget, Expenses, Remaining */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Total Budget Allocation */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Total Budget Allocation</h3>
                    <p className="text-2xl font-bold mt-1">
                        ${totalBudget.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">100% of total allocation</p>
                </div>

                {/* Current Expenses */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Current Expenses</h3>
                    <p className="text-2xl font-bold mt-1">
                        ${currentExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {((currentExpenses / totalBudget) * 100).toFixed(1)}% of total used
                    </p>
                </div>

                {/* Budget Remaining */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm text-gray-600">Budget Remaining</h3>
                    <p className="text-2xl font-bold mt-1">
                        ${remainingBudget.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {(((totalBudget - currentExpenses) / totalBudget) * 100).toFixed(1)}% of budget remaining
                    </p>
                </div>
            </div>

            {/* Charts Section: Left (Donut) + Right (Line) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Budget Distribution (Donut Chart) */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-800">Budget Distribution</h3>
                        <button
                            onClick={() => setBudgetDetailsModalOpen(true)}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            View Details
                        </button>
                    </div>
                    <div className="flex items-center justify-center h-52 bg-gray-50 rounded-lg">
                        <DonutChart expenseItems={expenseItems} />
                    </div>
                </div>

                {/* Expense Timeline (Line Chart) */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-800">Expense Timeline</h3>
                        <div>
                            <button className="text-primary text-sm font-medium hover:underline mr-2">
                                Monthly
                            </button>
                            <button className="text-gray-400 text-sm font-medium hover:underline">
                                Yearly
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-52 bg-gray-50 rounded-lg">
                        <LineChart expenseItems={expenseItems} />
                    </div>
                </div>
            </div>

            {/* Expense Categories Table */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-800">Expense Categories</h3>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none"
                        />
                        <button
                            onClick={() => setExpenseModalOpen(true)}
                            className="bg-primary text-black px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90"
                        >
                            Add Expense
                        </button>
                    </div>
                </div>
                <table className="min-w-full">
                    <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                        <th className="py-2">Category</th>
                        <th className="py-2">Allocated Budget</th>
                        <th className="py-2">Actual Spending</th>
                        <th className="py-2">Remaining</th>
                        <th className="py-2">Status</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm text-gray-600">
                    {categories.map((cat) => {
                        const remaining = cat.allocated - cat.actual;
                        const usedPercent = ((cat.actual / cat.allocated) * 100).toFixed(0);
                        return (
                            <tr key={cat.id} className="border-b border-gray-100">
                                <td className="py-3">{cat.name}</td>
                                <td className="py-3">${cat.allocated.toLocaleString()}</td>
                                <td className="py-3">${cat.actual.toLocaleString()}</td>
                                <td className="py-3">${remaining.toLocaleString()}</td>
                                <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {usedPercent}% used
                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Popup Modals */}

            {/* Budget Details Modal */}
            <Modal
                isOpen={isBudgetDetailsModalOpen}
                onClose={() => setBudgetDetailsModalOpen(false)}
                title="Budget Details"
            >
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Expense Breakdown</h4>
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="py-1 text-left">Category</th>
                            <th className="py-1 text-left">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {expenseItems.map((expense) => (
                            <tr key={expense.id} className="border-b">
                                <td className="py-1">{expense.category}</td>
                                <td className="py-1">${expense.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Add New Expense Modal */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                title="Add New Expense"
            >
                <form onSubmit={handleExpenseSubmit} className="space-y-4 text-black">
                    <input
                        type="text"
                        placeholder="Category"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Title"
                        value={newExpense.title}
                        onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black"
                    />
                    <button type="submit" className="w-full bg-primary rounded-lg px-4 py-2 text-black">
                        Save Expense
                    </button>
                </form>
            </Modal>
        </div>
    );
}
