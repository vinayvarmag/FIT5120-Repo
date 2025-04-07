"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = () => {
    const data = {
        labels: ["Venue", "Catering", "Decor", "Marketing"],
        datasets: [
            {
                label: "Budget Distribution",
                data: [800, 650, 250, 150],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: "right", // Moves legend labels to the right side
            },
        },
    };

    return (
        <div className="relative w-full h-full">
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default DonutChart;