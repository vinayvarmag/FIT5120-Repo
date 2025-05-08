"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* ---------------- helpers ---------------- */
const fetcher = (url) => fetch(url).then((r) => r.json());
const topN = (rows, key, n = 5) =>
    Object.entries(
        rows.reduce((acc, row) => {
            const k = row[key] ?? "Unknown";
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {})
    )
        .sort(([, a], [, b]) => b - a)
        .slice(0, n);

/* --------------- component --------------- */
export default function ResourcesClient({ currentModule }) {
    /* env vars (must start with NEXT_PUBLIC_) */
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.NEXT_PUBLIC_GOOGLE_CX;

    /* data ------------------------------------------------------------------- */
    const { data: rows, isLoading, error } = useSWR(
        `/data/${currentModule.datasetKey}.json`,
        fetcher
    );

    /* UI state --------------------------------------------------------------- */
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    /* external look‑ups ------------------------------------------------------- */
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
            )}&searchType=image&num=5`
            : null,
        fetcher
    );

    /* dataset‑specific config ------------------------------------------------- */
    const pickField =
        currentModule.id === "global-icons"
            ? "occupation"
            : currentModule.id === "traditional-arts"
                ? "craft"
                : ["cultural-festivals", "festivals"].includes(currentModule.id)
                    ? "country"
                    : currentModule.id === "celebrities"
                        ? "name"
                        : currentModule.id === "dishes"
                            ? "englishName"
                            : "type";

    const isFestivalModule = ["cultural-festivals", "festivals"].includes(
        currentModule.id
    );

    const filteredRows =
        rows?.filter((r) =>
            Object.values(r).some((v) =>
                String(v ?? "").toLowerCase().includes(query.toLowerCase())
            )
        ) ?? [];

    /* chart ------------------------------------------------------------------ */
    const showChart = rows && rows.length && !isFestivalModule;
    const chartData =
        showChart && {
            labels: topN(rows, pickField).map(([l]) => l),
            datasets: [
                {
                    label:
                        pickField === "country"
                            ? "Top 5 Countries"
                            : `Top 5 ${pickField[0].toUpperCase() + pickField.slice(1)}`,
                    data: topN(rows, pickField).map(([, c]) => c),
                    backgroundColor: "#6b21a8",
                    borderColor: "#6b21a8",
                    borderWidth: 1,
                    borderRadius: 6,
                },
            ],
        };

    const chartOptions = {
        plugins: { legend: { display: false } },
        scales: {
            y: {
                ticks: { color: "#6b7280" },
                grid: { color: "rgba(0,0,0,0.04)" },
            },
            x: {
                ticks: { color: "#6b7280" },
                grid: { display: false },
            },
        },
    };

    const previewFields =
        rows && rows.length
            ? isFestivalModule
                ? ["festival", "country"]
                : Object.keys(rows[0])
            : [];

    const openModalWith = (term) => {
        setSelected(term);
        setIsModalOpen(true);
    };

    /* --------------------------- render ------------------------------------ */
    return (
        <section className="mt-16 space-y-8">
            {isLoading && <p>Loading data…</p>}
            {error && <p className="text-red-600">Failed to load data.</p>}

            {rows && (
                <>
                    {/* header */}
                    <header className="space-y-2">
                        <h1 className="text-3xl font-bold">
                            Resources for {currentModule.title}
                        </h1>
                        <p className="text-gray-600">
                            Explore data insights and relevant external resources for this
                            module.
                        </p>
                    </header>

                    {/* chart */}
                    {showChart && (
                        <section>
                            <h2 className="text-2xl font-semibold">Data Insights</h2>
                            <p className="text-gray-600 mb-4">
                                A visual breakdown of the top 5{" "}
                                {pickField === "country" ? "countries" : pickField} from the
                                dataset.
                            </p>
                            <div className="rounded-lg bg-white p-4 shadow max-w-full overflow-hidden">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </section>
                    )}

                    {/* search */}
                    <section>
                        <h2 className="text-2xl font-semibold">Search Dataset</h2>
                        <p className="text-gray-600 mb-4">
                            Filter and search the dataset using keywords to find relevant
                            entries.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                            <input
                                type="text"
                                placeholder="Search…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && openModalWith(query)}
                                className="w-full sm:flex-grow rounded border px-3 py-2 break-words"
                            />
                            <button
                                onClick={() => openModalWith(query)}
                                className="w-full sm:w-auto rounded bg-purple-900 px-4 py-2 text-white"
                            >
                                Search
                            </button>
                        </div>
                    </section>

                    {/* table */}
                    <section>
                        <h2 className="text-2xl font-semibold">Data Preview</h2>
                        <p className="text-gray-600 mb-4">
                            Browse the first 10 results of your filtered dataset.
                        </p>
                        <div className="rounded-lg bg-white shadow max-w-full overflow-auto max-h-[400px] min-w-0">
                            <table className="w-full table-fixed text-sm">
                                <thead>
                                <tr>
                                    {previewFields.map((f) => (
                                        <th
                                            key={f}
                                            className="sticky top-0 bg-purple-800 px-4 py-2 text-left font-medium text-white uppercase break-words z-10"
                                        >
                                            {f}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {filteredRows.length ? (
                                    filteredRows.slice(0, 10).map((row, idx) => {
                                        const term = row[pickField];
                                        return (
                                            <tr
                                                key={idx}
                                                onClick={() => openModalWith(term)}
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                {previewFields.map((f) => (
                                                    <td
                                                        key={f}
                                                        className="whitespace-normal break-words px-4 py-2"
                                                    >
                                                        {row[f]}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={previewFields.length}
                                            className="px-4 py-2 text-center text-gray-700"
                                        >
                                            No matches found
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title={`External Resources for “${selected}”`}
                    >
                        {/* description */}
                        {googleError && (
                            <p className="text-red-600">Failed to fetch info.</p>
                        )}
                        {!googleData && !googleError && <p>Loading info…</p>}
                        {googleData?.items && (
                            <p className="mb-4">{googleData.items[0].snippet}</p>
                        )}

                        {/* images */}
                        {googleImageError && (
                            <p className="text-red-600">Failed to fetch images.</p>
                        )}
                        {!googleImageData && !googleImageError && <p>Loading images…</p>}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {googleImageData?.items?.map((img, i) => (
                                <a
                                    key={i}
                                    href={img.image.contextLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={img.link}
                                        alt={img.title}
                                        className="w-full h-32 object-cover rounded"
                                    />
                                </a>
                            ))}
                        </div>

                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(
                                selected
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            View full Google results
                        </a>
                    </Modal>
                </>
            )}
        </section>
    );
}
