/* File: src/app/modules/[id]/precinct/page.js */
"use client";

import dynamic from "next/dynamic";
import useSWR  from "swr";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend as ChartLegend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartLegend);

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });
const fetcher     = (url) => fetch(url).then((r) => r.json());

/* ── dataset helpers ────────────────────────────────────────── */
const datasetMeta = {
    Birthplace: {
        exclude: ["Australia"],
        includeBelow: "Australia",
    },
    Language: {
        exclude: ["Uses English only", "Language used at home not stated", "Other"],
        includeBelow: "Uses English only",
    },
    Religion: {
        exclude: [
            "Secular Other Spiritual and No Religious Affiliation Total",
            "Religious affiliation not stated",
        ],
        includeBelow: "Secular Other Spiritual and No Religious Affiliation Total",
    },
};

const palette = [
    '#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
    '#b3de69','#fccde5','#bc80bd','#ccebc5','#ffed6f','#e5c494',
    '#d95f02','#7570b3','#1b9e77','#e7298a','#66a61e','#a6761d',
    '#1f78b4','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00',
    '#cab2d6','#6a3d9a','#b2df8a','#b15928','#a6cee3','#fd8d3c'
];

function hexToHSL(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

export default function PrecinctPage() {
    /* ── reactive state ──────────────────────────────────────── */
    const [mode,        setMode]        = useState("Map");
    const [dataset,     setDataset]     = useState("Birthplace");
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [selectedVal, setSelectedVal] = useState("");
    const [overview,    setOverview]    = useState([]);
    const [values,      setValues]      = useState([]);

    const { data: countData } = useSWR(
        () => `/api/data?dataset=${dataset}`,
        fetcher
    );

    const classification = useRef({});
    const colours        = useRef({});
    const rawCounts      = useRef({});

    /* ── build colour buckets and aggregate counts ───────────── */
    useEffect(() => {
        colours.current = {};
        if (!countData?.rows) return;

        const meta   = datasetMeta[dataset];
        const cls    = {};
        const raw    = {};
        const totals = {};
        let ci       = 0;

        countData.rows.forEach(({ region, value, count }) => {
            if (!region || !value) return;
            raw[region]          = raw[region] || {};
            raw[region][value]   = (raw[region][value] || 0) + count;
            cls[region]          = cls[region] || [];
            cls[region].push({ value, count });
            totals[value]        = (totals[value] || 0) + count;
        });

        setValues(Object.keys(totals));

        Object.entries(cls).forEach(([region, arr]) => {
            const filtered = arr
                .filter((i) => !meta.exclude.includes(i.value))
                .sort((a, b) => b.count - a.count);

            const top   = filtered.slice(0, 5);
            const extra = arr.find((i) => i.value === meta.includeBelow);
            if (extra) top.push(extra);
            cls[region] = top;

            if (top[0]) {
                const v = top[0].value;
                if (!colours.current[v]) {
                    colours.current[v] = palette[ci++ % palette.length];
                }
            }
        });

        const ov = Object.entries(totals)
            .filter(([lbl]) =>
                !(dataset === "Language" && ["Language used at home not stated", "Other"].includes(lbl))
            )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([label, val]) => ({ label, value: val }));

        classification.current = cls;
        rawCounts.current      = raw;
        setOverview(ov);
        setShowHeatmap(false);
        setSelectedVal("");
    }, [countData, dataset]);

    /* ── map styling functions ───────────────────────────────── */
    const styleClass = useCallback((feature) => {
        const name = feature.properties.location_name || feature.properties.name;
        const best = classification.current[name]?.[0]?.value;
        return {
            color: "#555",
            weight: 1,
            fillColor: best ? colours.current[best] : "#cccccc",
            fillOpacity: 0.8,
        };
    }, []);

    const styleHeat = useCallback((feature) => {
        const name = feature.properties.location_name || feature.properties.name;
        const cnt  = rawCounts.current[name]?.[selectedVal] || 0;
        if (!cnt) return styleClass(feature);
        const [h, s, l] = hexToHSL(colours.current[selectedVal] || "#D1C4E9");
        const max       = Math.max(...Object.values(rawCounts.current).map((m) => m[selectedVal] || 0), 1);
        const newL      = l - (l - 30) * (cnt / max);
        return {
            color: "#555",
            weight: 1,
            fillColor: `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${newL.toFixed(1)}%)`,
            fillOpacity: 0.8,
        };
    }, [selectedVal, styleClass]);

    const onEach = useCallback(
        (feature, layer) => {
            const name = feature.properties.location_name || feature.properties.name;
            if (showHeatmap && selectedVal) {
                const cnt = rawCounts.current[name]?.[selectedVal] || 0;
                layer.bindTooltip(`${name}: ${cnt}`, { sticky: true });
            } else {
                const list  = classification.current[name] || [];
                const total = list.reduce((s, i) => s + i.count, 0);
                const html  = list
                    .map((i) => {
                        const pct = total ? ((i.count / total) * 100).toFixed(1) + "%" : "0%";
                        return `<div style="display:flex;justify-content:space-between"><span>${i.value}</span><span>${pct}</span></div>`;
                    })
                    .join("");
                layer.bindTooltip(`<strong>${name}</strong><br/>${html}`, { sticky: true });
            }
            layer.on({
                mouseover: (e) => e.target.setStyle({ weight: 2, color: "#222", fillOpacity: 1 }),
                mouseout : (e) => e.target.setStyle(showHeatmap ? styleHeat(feature) : styleClass(feature)),
            });
        },
        [showHeatmap, selectedVal, styleHeat, styleClass]
    );

    const gradientColors = useMemo(() => {
        if (!selectedVal) return { light: "#fff", dark: "#000" };
        const [h, s] = hexToHSL(colours.current[selectedVal] || "#D1C4E9");
        return {
            light: `hsl(${h.toFixed(0)},${s.toFixed(0)}%,90%)`,
            dark : `hsl(${h.toFixed(0)},${s.toFixed(0)}%,30%)`,
        };
    }, [selectedVal]);

    const maxCount = useMemo(() => {
        return selectedVal
            ? Math.max(...Object.values(rawCounts.current).map((m) => m[selectedVal] || 0), 1)
            : 0;
    }, [selectedVal]);

    /* ── render ──────────────────────────────────────────────── */
    return (
        <div className="min-h-screen pt-20">
            <div className="mx-auto max-w-screen-xl px-4">
                <h2 className="text-2xl font-bold">Cultural Precinct Exploration</h2>
                {/* mode + dataset toggles */}
                <div className="flex justify-between items-center mb-4">
                    {/* Overview / Map */}
                    <div className="inline-flex bg-gray-200 rounded-full p-1">
                        {["Overview", "Map"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                                    mode === m ? "bg-purple-600 text-white" : "text-black hover:bg-gray-300"
                                }`}
                            >{m}</button>
                        ))}
                    </div>
                    {/* Dataset */}
                    <div className="inline-flex bg-gray-200 rounded-full p-1">
                        {["Birthplace", "Language", "Religion"].map((ds) => (
                            <button
                                key={ds}
                                onClick={() => setDataset(ds)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition ${
                                    dataset === ds ? "bg-purple-600 text-white" : "text-black hover:bg-gray-300"
                                }`}
                            >{ds}</button>
                        ))}
                    </div>
                </div>

                {/* heatmap toggle */}
                <div className="flex items-center mb-4">
                    <div className="inline-flex bg-gray-200 rounded-full p-1">
                        {["Off", "Heatmap"].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setShowHeatmap(opt === "Heatmap")}
                                className={`px-2 py-1 text-xs font-medium rounded-full transition ${
                                    showHeatmap === (opt === "Heatmap")
                                        ? "bg-purple-600 text-white"
                                        : "text-black hover:bg-gray-300"
                                }`}
                            >{opt}</button>
                        ))}
                    </div>
                    {showHeatmap && (
                        <select
                            value={selectedVal}
                            onChange={(e) => setSelectedVal(e.target.value)}
                            className="ml-4 border-gray-300 border rounded px-3 py-2 text-sm"
                        >
                            <option value="">— select —</option>
                            {values.map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* map | heatmap legend */}
                {mode === "Map" && (
                    <div className="flex gap-4 mt-2 h-[60vh]">
                        {/* map */}
                        <div className="flex-3 rounded-2xl shadow-xl bg-white/90 backdrop-blur-lg ring-1 ring-black/10 overflow-visible">
                            <LocationMap
                                key={`${dataset}-${showHeatmap}-${selectedVal}`}
                                center={[-37.81, 144.96]}
                                zoom={7}
                                bounds={[[-39.2, 140.8], [-34.0, 150.0]]}
                                className="h-full w-full"
                                styleFn={showHeatmap ? styleHeat : styleClass}
                                onEachFn={onEach}
                            />
                        </div>
                        {/* legend */}
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-xl ring-1 ring-black/10 overflow-auto">
                            {showHeatmap && selectedVal ? (
                                <>
                                    <h3 className="font-semibold mb-2">{selectedVal}</h3>
                                    <div
                                        className="h-2 w-full mb-2 rounded"
                                        style={{ background:`linear-gradient(to right,${gradientColors.light},${gradientColors.dark})` }}
                                    />
                                    <div className="flex justify-between text-sm">
                                        <span>0</span><span>{maxCount}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-semibold mb-2">Legend</h3>
                                    {Object.entries(colours.current).map(([val, color]) => (
                                        <div key={val} className="flex items-center mb-1">
                                            <span className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: color }} />
                                            <span className="text-sm">{val}</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* overview chart */}
                {mode === "Overview" && (
                    <div className="mt-4 h-[60vh]">
                        <Bar
                            data={{
                                labels: overview.map((d) => d.label),
                                datasets: [{
                                    label: `Top ${overview.length} ${dataset}`,
                                    data : overview.map((d) => d.value),
                                    backgroundColor: "#9370DB",
                                }],
                            }}
                            options={{
                                indexAxis: "y",
                                plugins  : { legend: { display: false } },
                                scales   : { x: { beginAtZero: true } },
                            }}
                        />
                    </div>
                )}

                {/* ── disclaimer ──────────────────────────────── */}
                <p className="mt-8 text-center text-xs italic text-black">
                    Disclaimer: The demographic data shown is for informational purposes only and cultural data highlighted does not reflect cultural importance.
                </p>
            </div>
        </div>
    );
}