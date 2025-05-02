/* File: src/app/modules/page.js */
"use client";

import { useState }     from "react";
import { modulesIndex } from "@/lib/learningModules";
import ModuleCard       from "@/components/ModuleCard";

export default function LearningModulesPage() {
    const [asc, setAsc] = useState(true);
    const sorted = [...modulesIndex].sort((a, b) =>
        asc ? a.id - b.id : b.id - a.id
    );

    return (
        <main className="min-h-screen pt-20 bg-gradient-to-b from-orange-50 to-orange-100/60">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Learning modules</h1>
                    <button
                        onClick={() => setAsc(a => !a)}
                        className="rounded-full bg-gray-900 px-4 py-2 text-white"
                    >
                        Flip order
                    </button>
                </header>

                {/* modules grid */}
                <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {sorted.map(m => (
                        <ModuleCard key={m.id} module={m} />
                    ))}
                </section>

                {/* disclaimer */}
                <p className="mt-8 text-center text-xs italic text-gray-600">
                    Disclaimer: The cultural data presented in this project is subject to
                    limitations in scope, categorization, and source bias. While every effort
                    has been made to ensure fair and respectful representation, some cultural
                    groups may be underrepresented due to constraints in publicly available
                    datasets.
                </p>
            </div>
        </main>
    );
}
