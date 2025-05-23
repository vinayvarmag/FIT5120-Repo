/* Cultural Precinct Exploration */
"use client";

import dynamic from "next/dynamic";
import useSWR   from "swr";
import {
    useEffect, useRef, useState, useCallback, useMemo,
} from "react";
import "leaflet/dist/leaflet.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend as ChartLegend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, ChartLegend);

const fetcher     = url => fetch(url).then(r => r.json());
const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr:false });

/* ───── static helpers / palette ───── */
const datasetMeta = {
    Birthplace : { exclude:["Australia"], includeBelow:"Australia" },
    Language   : { exclude:["Uses English only","Language used at home not stated","Other"], includeBelow:"Uses English only" },
    Religion   : { exclude:[], includeBelow:"" },
};

const palette = [
    "#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5",
    "#bc80bd","#ccebc5","#ffed6f","#e5c494","#d95f02","#7570b3","#1b9e77","#e7298a",
    "#66a61e","#a6761d","#1f78b4","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
    "#cab2d6","#6a3d9a","#b2df8a","#b15928","#a6cee3","#fd8d3c",
];

function hexToHSL(hex){
    const r=parseInt(hex.slice(1,3),16)/255,
        g=parseInt(hex.slice(3,5),16)/255,
        b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h=0,s=0,l=(max+min)/2;
    if(max!==min){
        const d=max-min;
        s=l>0.5?d/(2-max-min):d/(max+min);
        switch(max){
            case r: h=(g-b)/d+(g<b?6:0); break;
            case g: h=(b-r)/d+2;         break;
            case b: h=(r-g)/d+4;         break;
        }
        h/=6;
    }
    return [h*360,s*100,l*100];
}

/* ==================================================================== */
export default function PrecinctPage(){
    /* -------- primary UI state -------- */
    const [mode,setMode]               = useState("Map");
    const [dataset,setDataset]         = useState("Birthplace");
    const [showHeatmap,setShowHeatmap] = useState(false);
    const [selectedVal,setSelectedVal] = useState("");

    /* -------- suburb search / highlight -------- */
    const [searchText,setSearchText]           = useState("");
    const [highlightSuburb,setHighlightSuburb] = useState("");

    const [overview,setOverview] = useState([]);
    const [values,setValues]     = useState([]);

    const { data:countData } = useSWR(() => `/api/data?dataset=${dataset}`, fetcher);

    /* -------- refs that hold classification + colours -------- */
    const classification = useRef({});
    const rawCounts      = useRef({});
    const colours        = useRef({});

    /* clear highlight/heatmap on Overview */
    useEffect(()=>{
        if(mode==="Overview"){
            setShowHeatmap(false);
            setSelectedVal("");
            setHighlightSuburb("");
        }
    },[mode]);

    /* -------- build classification on data load -------- */
    useEffect(()=>{
        colours.current={};
        if(!countData?.rows){
            classification.current={};
            rawCounts.current={};
            setOverview([]); setValues([]);
            setShowHeatmap(false); setSelectedVal("");
            return;
        }

        const meta  = datasetMeta[dataset];
        const cls   = {}, raw={}, totals={};
        let ci=0;

        countData.rows.forEach(({region,value,count})=>{
            if(!region||!value) return;
            raw[region]=raw[region]||{};
            raw[region][value]=(raw[region][value]||0)+count;
            cls[region]=cls[region]||[];
            cls[region].push({ value,count });
            totals[value]=(totals[value]||0)+count;
        });

        Object.entries(cls).forEach(([region,arr])=>{
            const filtered=arr.filter(i=>!meta.exclude.includes(i.value))
                .sort((a,b)=>b.count-a.count);
            const top=filtered.slice(0,5);
            const extra=arr.find(i=>i.value===meta.includeBelow);
            if(extra) top.push(extra);
            cls[region]=top;
            if(top[0]&&!colours.current[top[0].value]){
                colours.current[top[0].value]=palette[ci++%palette.length];
            }
        });

        const ov=Object.entries(totals)
            .filter(([lbl])=>!(
                dataset==="Language" &&
                ["Language used at home not stated","Other"].includes(lbl)
            ))
            .sort((a,b)=>b[1]-a[1]).slice(0,10)
            .map(([label,val])=>({label,value:val}));

        classification.current=cls;
        rawCounts.current=raw;
        setOverview(ov);
        setValues(Object.keys(totals));
        setShowHeatmap(false);
        setSelectedVal("");
    },[countData,dataset]);

    /* -------- helpers for heat-map shading -------- */
    const maxCount=useMemo(()=>showHeatmap&&selectedVal
        ? Math.max(...Object.values(rawCounts.current).map(m=>m[selectedVal]||0),0)
        : 0,[showHeatmap,selectedVal]);

    const gradientStops=useMemo(()=>{
        if(!showHeatmap||!selectedVal) return null;
        const [h,s,l]=hexToHSL(colours.current[selectedVal]||"#D1C4E9");
        return `linear-gradient(to right, hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%), hsl(${h.toFixed(0)},${s.toFixed(0)}%,30%))`;
    },[showHeatmap,selectedVal]);

    /* -------- style functions -------- */
    const styleClass=useCallback(feature=>{
        const name=feature.properties.location_name||feature.properties.name;
        const best=classification.current[name]?.[0]?.value;
        const isHi=highlightSuburb && name.toLowerCase()===highlightSuburb.toLowerCase();
        return {
            color:isHi?"#000":"#555",
            weight:isHi?3:1,
            fillColor:best?colours.current[best]:"transparent",
            fillOpacity:best?0.8:0,
        };
    },[highlightSuburb]);

    const styleHeat=useCallback(feature=>{
        const name=feature.properties.location_name||feature.properties.name;
        const cnt =rawCounts.current[name]?.[selectedVal]||0;
        const isHi=highlightSuburb && name.toLowerCase()===highlightSuburb.toLowerCase();
        if(!cnt){
            return { color:isHi?"#000":"#555", weight:isHi?3:1, fillColor:"transparent", fillOpacity:0 };
        }
        const [h,s,l]=hexToHSL(colours.current[selectedVal]||"#D1C4E9");
        const maxVal=Math.max(...Object.values(rawCounts.current).map(m=>m[selectedVal]||0),1);
        const newL=l-((l-30)*cnt)/maxVal;
        return {
            color:isHi?"#000":"#555", weight:isHi?3:1,
            fillColor:`hsl(${h.toFixed(0)},${s.toFixed(0)}%,${newL.toFixed(0)}%)`,
            fillOpacity:0.8,
        };
    },[selectedVal,highlightSuburb]);

    /* -------- tool-tips -------- */
    const onEach=useCallback((feature,layer)=>{
        const name=feature.properties.location_name||feature.properties.name;
        if(showHeatmap&&selectedVal){
            const cnt=rawCounts.current[name]?.[selectedVal]||0;
            layer.bindTooltip(`${name}: ${cnt}`,{sticky:true});
        }else{
            const list=classification.current[name]||[];
            const total=list.reduce((s,i)=>s+i.count,0);
            layer.bindTooltip(
                `<strong>${name}</strong><br/>${list.map(i=>{
                    const pct=total?((i.count/total)*100).toFixed(1)+"%":"0%";
                    return `<div style="display:flex;justify-content:space-between"><span>${i.value}</span><span>${pct}</span></div>`;
                }).join("")}`,
                {sticky:true}
            );
        }
        layer.on({
            mouseover:e=>e.target.setStyle({weight:2,color:"#222",fillOpacity:1}),
            mouseout:e=>e.target.setStyle(showHeatmap?styleHeat(feature):styleClass(feature)),
        });
    },[showHeatmap,selectedVal,styleClass,styleHeat]);

    /* -------- datalist options (filtered to 10) -------- */
    const suburbOptions=useMemo(()=>Object.keys(classification.current),[classification.current]);
    const filteredSuburbs=useMemo(()=>suburbOptions
        .filter(opt=>opt.toLowerCase().includes(searchText.toLowerCase()))
        .slice(0,10),[suburbOptions,searchText]);

    /* -------- dynamic heading string -------- */
    const headingText = useMemo(()=>{
        if(mode==="Overview"){
            if(dataset==="Birthplace") return "Top 10 Countries by Birthplace";
            if(dataset==="Language" ) return "Top 10 Languages Spoken";
            return "Top 10 Countries by Religion";
        }
        if(showHeatmap){
            if(dataset==="Birthplace") return "Heatmap of Birthplace Distribution";
            if(dataset==="Language" ) return "Heatmap of Language Distribution";
            return "Heatmap of Religious Affiliation";
        }
        if(dataset==="Birthplace") return "Map of Top Countries by Birthplace";
        if(dataset==="Language" ) return "Map of Top Languages Spoken";
        return "Map of Top Countries by Religion";
    },[mode,showHeatmap,dataset]);

    /* ============================== UI ============================== */
    return (
        <div className="min-h-screen pt-20">
            <div className="mx-auto max-w-screen-xl px-4">
                <h2 className="text-4xl text-center font-bold mb-4">
                    Cultural Precinct Exploration
                </h2>

                <p className="text-center text-gray-900 mb-4">
                    Interactive maps and data allow exploration of each suburb’s
                    cultural profile, including birthplace, languages spoken,
                    and religious affiliation.
                </p>

                {/* brief explanation paragraph */}
                <p className="text-center text-gray-900 mb-6">
                    Heatmap provides the numerical distribution of each legend category
                    by selected field (birthplace, language, and religion) while
                    Overview shows a bar chart to visualize the overall dataset.
                </p>

                {/* -------- heading + suburb search (side-by-side) -------- */}
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-2xl font-bold text-black">
                        {headingText}
                    </div>

                    {mode==="Map" && (
                        <div className="flex items-center gap-2 md:shrink-0">
                            <input
                                type="text"
                                list="suburb-list"
                                value={searchText}
                                onChange={e=>setSearchText(e.target.value)}
                                placeholder="Search suburb…"
                                className="w-56 border rounded px-3 py-2 text-sm"
                            />
                            <datalist id="suburb-list">
                                {filteredSuburbs.map(opt=>(
                                    <option key={opt} value={opt}/>
                                ))}
                            </datalist>
                            <button
                                onClick={()=>setHighlightSuburb(searchText)}
                                className="px-4 py-2 bg-purple-800 text-white rounded"
                            >
                                Highlight
                            </button>
                            {highlightSuburb && (
                                <button
                                    onClick={()=>{
                                        setHighlightSuburb("");
                                        setSearchText("");
                                    }}
                                    className="px-3 py-2 text-sm underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* -------- mode toggle -------- */}
                <div className="flex justify-between mb-4">
                    <div className="inline-flex bg-gray-200 rounded-full p-1">
                        {["Map","Overview"].map(m=>(
                            <button
                                key={m}
                                onClick={()=>setMode(m)}
                                className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                                    mode===m
                                        ? "bg-purple-800 text-white"
                                        : "text-black hover:bg-gray-300"
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* -------- dataset radios -------- */}
                <ul className="mb-4 text-black">
                    {[
                        {key:"Birthplace", label:"most common birth origins per precinct."},
                        {key:"Language"  , label:"primary home languages by precinct."},
                        {key:"Religion"  , label:"distribution of religious affiliations."},
                    ].map(item=>(
                        <li key={item.key} className="flex items-start mb-2">
                            <input
                                type="radio"
                                name="dataset"
                                value={item.key}
                                checked={dataset===item.key}
                                onChange={()=>setDataset(item.key)}
                                className="mt-1"
                            />
                            <label htmlFor={item.key} className="ml-2">
                                <strong>{item.key}</strong>: {item.label}
                            </label>
                        </li>
                    ))}
                </ul>

                {/* -------- heat-map controls (Map only) -------- */}
                {mode==="Map" && (
                    <div className="flex items-center mb-4">
                        <div className="inline-flex bg-gray-200 rounded-full p-1">
                            {["Off","Heatmap"].map(opt=>(
                                <button
                                    key={opt}
                                    onClick={()=>setShowHeatmap(opt==="Heatmap")}
                                    className={`px-2 py-1 text-xs font-medium rounded-full transition ${
                                        showHeatmap===(opt==="Heatmap")
                                            ? "bg-purple-800 text-white"
                                            : "text-black hover:bg-gray-300"
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {showHeatmap && (
                            <select
                                value={selectedVal}
                                onChange={e=>setSelectedVal(e.target.value)}
                                className="ml-4 border-gray-300 border rounded px-3 py-2 text-sm"
                            >
                                <option value="">— select —</option>
                                {values.map(v=>(
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* -------- map or bar-chart -------- */}
                {mode==="Overview" ? (
                    <Bar
                        data={{
                            labels: overview.map(o=>o.label),
                            datasets:[{
                                label: dataset,
                                data : overview.map(o=>o.value),
                                backgroundColor: overview.map(()=>"rgba(107,33,168,0.9)"),
                            }],
                        }}
                        options={{
                            indexAxis:"y",
                            plugins:{ legend:{ display:true, position:"bottom" } },
                            scales : {
                                x:{ beginAtZero:true },
                                y:{ ticks:{ autoSkip:false } },
                            },
                        }}
                    />
                ) : (
                    <div className="flex gap-4 mt-2 h-[60vh]">
                        <div className="flex-1 rounded-2xl shadow bg-white/90 backdrop-blur-lg ring-1 ring-black/10 overflow-hidden">
                            <LocationMap
                                key={`${dataset}-${showHeatmap}-${selectedVal}-${highlightSuburb}-${JSON.stringify(countData?.rows)}`}
                                center={[-37.81,144.96]}
                                zoom={7}
                                bounds={[[-39.2,140.8],[-34.0,150.0]]}
                                className="h-full w-full"
                                styleFn={showHeatmap ? styleHeat : styleClass}
                                onEachFn={onEach}
                            />
                        </div>

                        <div className="w-64 bg-white p-4 rounded-lg shadow h-[60vh] overflow-auto">
                            <h3 className="font-semibold mb-2">Legend</h3>
                            {showHeatmap && selectedVal ? (
                                <>
                                    <div className="h-4 rounded" style={{background:gradientStops}}/>
                                    <div className="flex justify-between text-xs mt-1">
                                        <span>0</span>
                                        <span>{maxCount}</span>
                                    </div>
                                </>
                            ) : (
                                <ul>
                                    {Object.entries(colours.current).map(([label,color])=>(
                                        <li key={label} className="flex items-center mb-1">
                                            <span className="w-4 h-4 mr-2 rounded-sm" style={{backgroundColor:color}}/>
                                            <span className="text-sm truncate">{label}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                <p className="mt-8 text-center text-xs italic text-black">
                    Disclaimer: Demographic data is informational only.
                </p>
            </div>
        </div>
    );
}
