/* DonutChart.js */
"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

export default function DonutChart({ expenseItems = [] }) {
    /* aggregate spend per category … (unchanged) */
    const categorySums = expenseItems.reduce((acc, exp) => {
        const cat = exp?.category || "Uncategorized";
        acc[cat]  = (acc[cat] || 0) + Number(exp?.amount || 0);
        return acc;
    }, {});

    const labels     = Object.keys(categorySums);
    const dataPoints = Object.values(categorySums);

    const data = {
        labels,
        datasets: [
            {
                data: dataPoints,
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#66ff66", "#ff6666", "#6699ff", "#ffcc66",
                ],
                hoverBackgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#66ff66", "#ff6666", "#6699ff", "#ffcc66",
                ],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,        // we’ll control height ourselves
        plugins: {
            legend: {
                position: "right",
                labels: { boxWidth: 20, padding: 10 },
            },
        },
    };

    if (!labels.length) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No expense data
            </div>
        );
    }

    /*  ➟ fixed-height wrapper keeps the canvas from growing            */
    return (
        <div className="relative w-full h-64"> {/* h-64 = 16 rem ≈ 256 px */}
            <Doughnut data={data} options={options} />
        </div>
    );
}
