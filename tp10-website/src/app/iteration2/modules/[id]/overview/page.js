"use client";

import useSWR from "swr";
import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";

const fetcher = url => fetch(url).then(r => r.json());

export default function OverviewPage({ params }) {
    // Rename module to avoid shadowing
    const currentModule = modulesById[params.id];

    // Unconditionally call SWR
    const { data: rows, isLoading, error } = useSWR(
        currentModule ? `/data/${currentModule.datasetKey}.json` : null,
        fetcher
    );

    // Guards
    if (!currentModule) return notFound();
    if (isLoading)      return <p className="text-center text-black">Loading overview…</p>;
    if (error)          return <p className="text-red-600">Failed to load overview data.</p>;

    const preview = (rows ?? []).slice(0, 3);

    return (
        <section className="space-y-6">
            <p className="text-black">{currentModule.overview}</p>

            {rows.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold">Quick glimpse</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-black">
                        {preview.map((r, i) => (
                            <li key={i}>
                                {params.id === "global-icons"       && `${r.name} — ${r.country}`}
                                {params.id === "traditional-arts"   && `${r.craft} — ${r.country}`}
                                {params.id === "cultural-festivals" && `${r.festival} — ${r.country}`}
                                {params.id === "world-dishes"       && `${r.englishName} — ${r.country}`}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}
