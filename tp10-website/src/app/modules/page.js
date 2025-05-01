"use client";

import Link   from "next/link";
import useSWR from "swr";
import { learningModules } from "@/lib/learningModules";

const fetcher = url => fetch(url).then(r => r.json());

function ModuleCard({ module }) {
    const { data } = useSWR(() => `/data/${module.datasetKey}.json`, fetcher);
    const preview = data?.slice(0, 3) ?? [];   // first 3 rows for a quick glance

    return (
        <Link
            href={`/modules/${module.id}`}
            className="block rounded-xl border p-5 shadow transition hover:shadow-md"
        >
            <h3 className="mb-2 text-lg font-semibold">{module.title}</h3>
            <p className="mb-4 text-sm text-gray-700">{module.overview}</p>

            <ul className="space-y-1 text-xs text-gray-600">
                {preview.map((row, i) => (
                    <li key={i}>
                        {module.id === "global-icons"      && `${row.name} — ${row.country}`}
                        {module.id === "traditional-arts"  && `${row.craft} — ${row.country}`}
                        {module.id === "cultural-festivals"&& `${row.festival} — ${row.country}`}
                        {module.id === "world-dishes"      && `${row.englishName} — ${row.country}`}
                    </li>
                ))}
            </ul>
        </Link>
    );
}

export default function ModuleListPage() {
    return (
        <main className="mx-auto max-w-5xl grid gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
            {learningModules.map(m => (
                <ModuleCard key={m.id} module={m} />
            ))}
        </main>
    );
}
