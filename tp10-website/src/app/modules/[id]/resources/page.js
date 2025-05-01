"use client";

import useSWR            from "swr";
import { notFound }      from "next/navigation";
import { modulesById }   from "@/lib/learningModules";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fetcher = url => fetch(url).then(r => r.json());

const topN = (rows, key, n = 5) =>
    Object.entries(
        rows.reduce((acc, r) => {
            const k = r[key] ?? "Unknown";
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);

export default function ResourcesPage({ params }) {
    const module = modulesById[params.id];
    if (!module) return notFound();

    const { data: rows, isLoading, error } = useSWR(
        () => `/data/${module.datasetKey}.json`,
        fetcher
    );

    const pickField =
        module.id === "global-icons"
            ? "occupation"
            : module.id === "traditional-arts"
                ? "craft"
                : module.id === "cultural-festivals"
                    ? "festival"
                    : "type";

    /* ── data + styling for the chart ───────────────────────── */
    let chart = null;
    const options = {
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { color: "#6b7280" },
                grid: { color: "rgba(0,0,0,0.04)" }
            },
            x: {
                ticks: { color: "#6b7280" },
                grid: { display: false }
            }
        }
    };

    if (rows) {
        const pairs = topN(rows, pickField);
        chart = {
            labels: pairs.map(([l]) => l),
            datasets: [
                {
                    label: `Top 5 ${pickField}`,
                    data: pairs.map(([, c]) => c),
                    backgroundColor: "rgba(186, 104, 200, 0.6)", // light-purple fill
                    borderColor:     "rgba(156, 39, 176, 1)",     // deeper purple edge
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        };
    }

    /* ── UI ─────────────────────────────────────────────────── */
    return (
        <section className="space-y-8">
            {isLoading && <p>Loading data…</p>}
            {error && <p className="text-red-600">Failed to load dataset.</p>}

            {rows && (
                <>
                    <h2 className="text-lg font-semibold">Dataset stats</h2>

                    <ul className="flex flex-wrap gap-4 text-sm">
                        <li className="rounded-lg bg-orange-50 px-4 py-2 shadow">
                            <span className="font-bold">{rows.length}</span> records
                        </li>
                        <li className="rounded-lg bg-orange-50 px-4 py-2 shadow">
              <span className="font-bold">
                {new Set(rows.map(r => r.country)).size}
              </span>{" "}
                            countries
                        </li>
                    </ul>

                    {/* bar chart */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        {chart && <Bar data={chart} options={options} />}
                    </div>

                    {/* data preview */}
                    <h3 className="text-md font-medium">First 30 rows</h3>
                    <div className="overflow-x-auto rounded-lg border bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                            <tr>
                                {Object.keys(rows[0] ?? {}).map(col => (
                                    <th
                                        key={col}
                                        className="px-4 py-2 text-left font-medium text-gray-700"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {rows.slice(0, 30).map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((cell, j) => (
                                        <td key={j} className="whitespace-nowrap px-4 py-2">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}
