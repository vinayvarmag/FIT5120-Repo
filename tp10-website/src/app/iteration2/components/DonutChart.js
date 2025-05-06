"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register the required elements
Chart.register(ArcElement, Tooltip, Legend);

function DonutChart({ expenseItems }) {
    // 1) Group amounts by category
    const categorySums = {};
    expenseItems.forEach((expense) => {
        const category = expense.category || "Uncategorized";
        const amount = Number(expense.amount) || 0;

        if (!categorySums[category]) {
            categorySums[category] = 0;
        }
        categorySums[category] += amount;
    });

    // 2) Build the labels and data arrays for the chart
    const labels = Object.keys(categorySums);
    const dataPoints = Object.values(categorySums);

    // 3) Chart.js configuration
    const data = {
        labels,
        datasets: [
            {
                data: dataPoints,
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                    "#66ff66",
                    "#ff6666",
                    "#6699ff",
                    "#ffcc66"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                    "#66ff66",
                    "#ff6666",
                    "#6699ff",
                    "#ffcc66"
                ]
            },
        ],
    };

    // 4) Chart options: position the legend to the right
    const options = {
        plugins: {
            legend: {
                position: "right", // moves legend to right side
                labels: {
                    // Optionally customize legend text style here
                    boxWidth: 20,
                    padding: 10,
                }
            },
        },
        maintainAspectRatio: false,
    };

    // 5) Render the Doughnut chart with custom options
    return <Doughnut data={data} options={options} />;
}

export default DonutChart;