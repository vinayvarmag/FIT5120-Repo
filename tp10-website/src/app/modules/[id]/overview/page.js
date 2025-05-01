"use client";

import useSWR            from "swr";
import { notFound }      from "next/navigation";
import { modulesById }   from "@/lib/learningModules";

const fetcher = url => fetch(url).then(r => r.json());

export default function OverviewPage({ params }) {
    const module = modulesById[params.id];
    if (!module) return notFound();

    const { data: rows } = useSWR(
        () => `/data/${module.datasetKey}.json`,
        fetcher
    );

    const preview = rows?.slice(0, 3) ?? [];

    return (
        <section className="space-y-6">
            <p className="text-gray-800">{module.overview}</p>

            {rows && (
                <>
                    <h2 className="text-lg font-semibold">Quick glimpse</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
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
