/* File: src/app/modules/[id]/resources/page.js */
"use client";

/* ─── libraries ─── */
import { useState } from "react";
import useSWR from "swr";
import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";
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

/* Google CSE env vars */
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CX      = process.env.NEXT_PUBLIC_GOOGLE_CX;

export default function ResourcesPage({ params }) {
    /* ── 1. module lookup (no early return yet) ── */
    const currentModule = modulesById[params.id];

    /* ── 2. Hooks are ALWAYS called ── */
    const { data: rows, isLoading, error } = useSWR(
        currentModule ? `/data/${currentModule.datasetKey}.json` : null,
        fetcher
    );

    const [query,    setQuery]    = useState("");
    const [selected, setSelected] = useState("");

    /* Google Custom Search API (hooks still unconditional) */
    const { data: googleData, error: googleError } = useSWR(
        selected
            ? `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
                selected
            )}`
            : null,
        fetcher
    );
    const { data: googleImageData, error: googleImageError } = useSWR(
        selected
            ? `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
                selected
            )}&searchType=image&num=1`
            : null,
        fetcher
    );

    /* ── 3. Safe early bail-out AFTER hooks ── */
    if (!currentModule) return notFound();

    /* ── 4. Derived values (not hooks) ── */
    const pickField =
        currentModule.id === "global-icons"
            ? "occupation"
            : currentModule.id === "traditional-arts"
                ? "craft"
                : currentModule.id === "cultural-festivals" || currentModule.id === "festivals"
                    ? "festival"
                    : currentModule.id === "celebrities"
                        ? "name"
                        : currentModule.id === "dishes"
                            ? "englishName"
                            : "type";

    const filteredRows = rows
        ? rows.filter(row =>
            Object.values(row).some(val =>
                String(val ?? "").toLowerCase().includes(query.toLowerCase())
            )
        )
        : [];

    const chart = rows
        ? {
            labels: topN(rows, pickField).map(([l]) => l),
            datasets: [
                {
                    label: `Top 5 ${pickField}`,
                    data: topN(rows, pickField).map(([, c]) => c),
                    backgroundColor: "rgba(186, 104, 200, 0.6)",
                    borderColor: "rgba(156, 39, 176, 1)",
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        }
        : null;

    const options = {
        plugins: { legend: { display: false } },
        scales: {
            y: { ticks: { color: "#6b7280" }, grid: { color: "rgba(0,0,0,0.04)" } },
            x: { ticks: { color: "#6b7280" }, grid: { display: false } }
        }
    };

    /* ── 5. Render ── */
    return (
        <section className="space-y-8">
            {isLoading && <p>Loading data…</p>}
            {error && <p className="text-red-600">Failed to load data.</p>}

            {rows && (
                <>
                    {/* Bar chart */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        {chart && <Bar data={chart} options={options} />}
                    </div>

                    {chart && (
                        <p className="text-center text-sm text-black">
                            Bar chart showing the top 5 {pickField} counts.
                        </p>
                    )}

                    {/* Search box */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && setSelected(query)}
                            placeholder="Search…"
                            className="flex-grow rounded border px-3 py-2"
                        />
                        <button
                            onClick={() => setSelected(query)}
                            className="rounded bg-blue-600 px-4 py-2 text-white"
                        >
                            Search
                        </button>
                    </div>

                    {/* Data preview */}
                    <h3 className="text-md font-medium">First 30 results</h3>
                    <div className="overflow-x-auto rounded-lg border bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                            <tr>
                                {Object.keys(rows[0] ?? {}).map(col => (
                                    <th
                                        key={col}
                                        className="px-4 py-2 text-left font-medium text-black"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {filteredRows.length ? (
                                filteredRows.slice(0, 30).map((row, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => setSelected(row[pickField])}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        {Object.values(row).map((cell, j) => (
                                            <td
                                                key={j}
                                                className="whitespace-nowrap px-4 py-2"
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={Object.keys(rows[0] || {}).length}
                                        className="px-4 py-2 text-center text-black"
                                    >
                                        No matches found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Google results */}
                    {selected && (
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold">{selected}</h2>

                            {googleError && (
                                <p className="text-red-600">Failed to fetch info.</p>
                            )}
                            {!googleData && !googleError && <p>Loading info…</p>}
                            {googleData?.items && <p>{googleData.items[0].snippet}</p>}

                            {googleImageError && (
                                <p className="text-red-600">Failed to fetch image.</p>
                            )}
                            {!googleImageData && !googleImageError && <p>Loading image…</p>}
                            {googleImageData?.items && (
                                <img
                                    src={googleImageData.items[0].link}
                                    alt={selected}
                                    className="max-w-sm rounded"
                                />
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
