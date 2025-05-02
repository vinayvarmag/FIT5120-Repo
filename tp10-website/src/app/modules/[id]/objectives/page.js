"use client";

import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";

export default function ObjectivesPage({ params }) {
    const module = modulesById[params.id];
    if (!module) return notFound();

    /* Expecting module.objectives to be an array of strings */
    const objectives = module.objectives ?? [];

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-orange-700">Learning objectives</h2>

            <ul className="list-disc pl-6 space-y-2 text-gray-800">
                {objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                ))}
            </ul>
        </section>
    );
}
