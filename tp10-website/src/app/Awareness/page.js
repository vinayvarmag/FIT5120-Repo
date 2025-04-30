"use client";

import dynamic from "next/dynamic";
import { modulesIndex } from "@/lib/learningModules";
import ModuleCard from "@/components/ModuleCard";
import { useState } from "react";

// Dynamically load the Leaflet map on the client to avoid SSR issues
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
    ssr: false,
});

// Victoria bounding box (approx.) → [[south‑west],[north‑east]]
const VIC_BOUNDS = [
    [-39.2, 140.8], // SW corner
    [-34.0, 150.0], // NE corner
];

export default function AwarenessPage() {
    const [ascending, setAscending] = useState(true);
    const sorted = [...modulesIndex].sort((a, b) =>
        ascending ? a.id - b.id : b.id - a.id
    );

    return (
        <div className="min-h-screen pt-20 w-full bg-gradient-to-b from-orange-50 to-orange-100/60">
            {/* —–––––– Map card –––––– */}
            <div className="mx-auto max-w-4xl px-4">
                <div className="rounded-2xl shadow-xl overflow-hidden bg-white/90 backdrop-blur-lg ring-1 ring-black/10 h-96">
                    {/* Make the map take the entire card */}
                    <LocationMap
                        center={[-37.5, 145]}
                        zoom={6}
                        bounds={VIC_BOUNDS}
                        className="h-full w-full" // LocationMap uses inline style, but we pass for safety
                    />
                </div>
            </div>

            {/* —–––––– Rest of the page –––––– */}
            <main className="mx-auto max-w-7xl px-4 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-black">Learning&nbsp;modules →</h1>
                    <button
                        onClick={() => setAscending(!ascending)}
                        className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow"
                    >
                        Flip order
                    </button>
                </header>

                <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 text-black">
                    {sorted.map((m) => (
                        <ModuleCard key={m.id} module={m} />
                    ))}
                </section>
            </main>
        </div>
    );
}
