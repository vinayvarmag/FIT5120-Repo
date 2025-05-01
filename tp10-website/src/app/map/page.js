/* app/page.js */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend as ChartLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartLegend);

/* ---------- helpers ----------- */
function hexToHSL(H) {
    let r = parseInt(H.slice(1, 3), 16) / 255;
    let g = parseInt(H.slice(3, 5), 16) / 255;
    let b = parseInt(H.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2;           break;
            case b: h = (r - g) / d + 4;           break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

/* ---------- dynamic leaflet ----------- */
const MapContainer = dynamic(
    () => import('react-leaflet').then(m => m.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then(m => m.TileLayer),
    { ssr: false }
);
const GeoJSON = dynamic(
    () => import('react-leaflet').then(m => m.GeoJSON),
    { ssr: false }
);

/* ---------- configuration ----------- */
const datasetMeta = {
    Birthplace: {
        exclude: ['Australia'],
        includeBelow: 'Australia',
    },
    Language: {
        exclude: [
            'Uses English only',
            'Language used at home not stated',
            'Other',
        ],
        includeBelow: 'Uses English only',
    },
    Religion: {
        exclude: [
            'Secular Other Spiritual and No Religious Affiliation Total',
            'Religious affiliation not stated',
        ],
        includeBelow:
            'Secular Other Spiritual and No Religious Affiliation Total',
    },
};

const palette = [
    '#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462',
    '#b3de69','#fccde5','#bc80bd','#ccebc5','#ffed6f','#e5c494',
    '#d95f02','#7570b3','#1b9e77','#e7298a','#66a61e','#a6761d',
    '#1f78b4','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00',
    '#cab2d6','#6a3d9a','#b2df8a','#b15928','#a6cee3','#fd8d3c'
];

/* ---------- component ----------- */
export default function Awareness() {
    /* state */
    const [geoData, setGeoData]         = useState(null);
    const [dataset, setDataset]         = useState('Birthplace');
    const [dataReady, setDataReady]     = useState(false);
    const [key, setKey]                 = useState(0);
    const [mode, setMode]               = useState('Map');
    const [overview, setOverview]       = useState([]);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');

    /* refs */
    const classification = useRef({});
    const top1           = useRef({});
    const colours        = useRef({});
    const rawCounts      = useRef({});

    /* load data on dataset change */
    useEffect(() => {
        (async () => {
            setDataReady(false);
            setShowHeatmap(false);
            setSelectedValue('');
            setKey(k => k + 1);

            // fetch boundaries
            const geoJson = await fetch('/api/locations').then(r => r.json());

            // fetch counts
            const rows = await fetch(`/api/data?dataset=${dataset}`)
                .then(r => r.json())
                .then(j => j.rows);

            // build classification, colours, totals
            const meta   = datasetMeta[dataset];
            const clr    = {};
            const cls    = {};
            const t1Reg  = {};
            const raw    = {};
            const totals = {};
            let ci = 0;

            rows.forEach(({ region, value, count }) => {
                if (!region || !value || !count) return;
                raw[region] = raw[region] || {};
                raw[region][value] = (raw[region][value] || 0) + count;
                cls[region] = cls[region] || [];
                cls[region].push({ value, count });
                totals[value] = (totals[value] || 0) + count;
            });

            // pick top-5 + includeBelow
            for (const [region, arr] of Object.entries(cls)) {
                const filtered = arr
                    .filter(i => !meta.exclude.includes(i.value))
                    .sort((a,b) => b.count - a.count);
                const top = filtered.slice(0,5);
                const extra = arr.find(i => i.value === meta.includeBelow);
                if (extra) top.push(extra);
                cls[region] = top;
                if (top.length) {
                    const v = top[0].value;
                    t1Reg[region] = v;
                    if (!clr[v]) clr[v] = palette[ci++ % palette.length];
                }
            }

            // overview top-10
            const overviewArr = Object.entries(totals)
                .filter(([lbl]) => !(dataset==='Language' &&
                    ['Language used at home not stated','Other'].includes(lbl)))
                .sort((a,b) => b[1]-a[1])
                .slice(0,10)
                .map(([label,value]) => ({ label, value }));

            classification.current = cls;
            top1.current           = t1Reg;
            colours.current        = clr;
            rawCounts.current      = raw;
            setOverview(overviewArr);
            setGeoData(geoJson);
            setDataReady(true);
        })();
    }, [dataset]);

    /* styling helpers */
    const styleClass = f => {
        const name = f.properties.location_name;
        const best = top1.current[name];
        const item = (classification.current[name] || [])
            .find(i => i.value === best);
        const fill = best && item ? colours.current[best] : '#cccccc';
        return { color:'#555', weight:1, fillColor:fill, fillOpacity:0.8 };
    };

    const styleHeat = f => {
        const name = f.properties.location_name;
        const cnt  = rawCounts.current[name]?.[selectedValue] || 0;
        if (!cnt) return { ...styleClass(f), fillColor:'#cccccc' };
        const baseHex = colours.current[selectedValue] || '#D1C4E9';
        const [h,s,l] = hexToHSL(baseHex);
        const max = Math.max(
            ...Object.values(rawCounts.current).map(m=>m[selectedValue]||0), 1
        );
        const ratio = cnt/max;
        const newL = l - (l-30)*ratio;
        return {
            color:'#555', weight:1,
            fillColor:`hsl(${h.toFixed(0)},${s.toFixed(0)}%,${newL.toFixed(1)}%)`,
            fillOpacity:0.8
        };
    };

    const onEach = useCallback((feat, layer) => {
        const name = feat.properties.SA2_NAME21;
        if (showHeatmap && selectedValue) {
            const cnt = rawCounts.current[name]?.[selectedValue] || 0;
            layer.bindTooltip(`<strong>${name}</strong><br/>${selectedValue}: ${cnt}`, { sticky:true });
        } else {
            const list = classification.current[name] || [];
            const total = list.reduce((s,i)=>s+i.count,0);
            const html = list.map(i => {
                const pct = total ? ((i.count/total)*100).toFixed(1)+'%' : '0.0%';
                return `<div style="display:flex;justify-content:space-between">
                  <span>${i.value}</span><span>${pct}</span>
                </div>`;
            }).join('');
            layer.bindTooltip(`<strong>${name}</strong><br/>${html||'No data'}`, { sticky:true });
        }
        layer.on({
            mouseover: e => e.target.setStyle({ weight:2, color:'#222', fillOpacity:1 }),
            mouseout:  e => e.target.setStyle(
                showHeatmap ? styleHeat(e.target.feature) : styleClass(e.target.feature)
            )
        });
    }, [showHeatmap, selectedValue, key]);

    /* render */
    return (
        <div className="flex flex-col items-center w-full pt-5">
            {/* ───── CONTROLS ───── */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
                {/* Mode toggle */}
                {['Map','Overview'].map(m => (
                    <button
                        key={m}
                        className={`px-4 py-2 rounded ${
                            mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}
                        onClick={() => setMode(m)}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {mode === 'Map' && (
                <div className="flex flex-wrap justify-center gap-6 mb-6 items-center">
                    {/* Dataset radios */}
                    <div>
                        <span className="font-semibold mr-2">Dataset:</span>
                        {Object.keys(datasetMeta).map(ds => (
                            <label key={ds} className="mr-4 inline-flex items-center">
                                <input
                                    type="radio"
                                    name="dataset"
                                    value={ds}
                                    checked={dataset === ds}
                                    onChange={() => setDataset(ds)}
                                    className="mr-1"
                                />
                                {ds}
                            </label>
                        ))}
                    </div>
                    {/* Heatmap toggle */}
                    <div className="inline-flex items-center">
                        <label className="font-semibold mr-2">Heatmap:</label>
                        <input
                            type="checkbox"
                            checked={showHeatmap}
                            onChange={() => setShowHeatmap(v => !v)}
                            className="mr-4"
                        />
                        {showHeatmap && (
                            <select
                                value={selectedValue}
                                onChange={e => setSelectedValue(e.target.value)}
                                className="border px-2 py-1 rounded"
                            >
                                <option value="">Select value</option>
                                {Object.keys(colours.current).map(val => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            )}
            {/* ───── END CONTROLS ───── */}

            {mode === 'Map' && geoData && dataReady && (
                <div className="relative">
                    <MapContainer
                        key={`map-${key}`}
                        center={[-37.8, 144.9]}
                        zoom={7}
                        style={{ height: 700, width: '80vw' }}
                    >
                        <TileLayer
                            attribution="© OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <GeoJSON
                            key={`geo-${key}-${showHeatmap}-${selectedValue}`}
                            data={geoData}
                            style={f => showHeatmap ? styleHeat(f) : styleClass(f)}
                            onEachFeature={onEach}
                        />
                    </MapContainer>

                    {/* Legend */}
                    <div className="absolute top-4 right-4 bg-white p-2 rounded shadow max-h-[50vh] overflow-auto">
                        {Object.entries(colours.current).map(([val, color]) => (
                            <div key={val} className="flex items-center mb-1">
                                <span className="w-4 h-4 mr-2" style={{ backgroundColor: color }}></span>
                                <span className="text-sm">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'Overview' && overview.length > 0 && (
                <div className="w-[80vw] h-[600px]">
                    <Bar
                        data={{
                            labels: overview.map(d => d.label),
                            datasets: [{
                                label: `Top ${overview.length} ${dataset}`,
                                data: overview.map(d => d.value),
                                backgroundColor: '#9370DB'
                            }]
                        }}
                        options={{
                            indexAxis: 'y',
                            plugins: { legend: { display: false } },
                            scales: { x: { beginAtZero: true } }
                        }}
                    />
                </div>
            )}
        </div>
    );
}
