"use client";

import { notFound }    from "next/navigation";
import { modulesById } from "@/lib/learningModules";

export default function ObjectivesPage({ params }) {
    const currentModule = modulesById[params.id];
    if (!currentModule) return notFound();

    return (
        <section className="space-y-4">
            <h2 className="text-lg font-semibold">Learning objectives</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-800">
                {currentModule.objectives.map(obj => (
                    <li key={obj}>{obj}</li>
                ))}
            </ul>
        </section>
    );
}
