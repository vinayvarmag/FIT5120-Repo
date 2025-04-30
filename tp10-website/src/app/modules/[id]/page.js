/* Dynamic detail page */
"use client";

import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";

export default function ModuleDetail({ params }) {
    const currentModule = modulesById[params.id];
    if (!currentModule) return notFound();

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-orange-100/60">
            <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
                {/* Title & overview */}
                <section className="space-y-4">
                    <h1 className="text-3xl font-bold">{currentModule.title}</h1>
                    <p className="text-gray-800">{currentModule.overview}</p>
                </section>

                {/* Video embed */}
                {currentModule.resources?.video && (
                    <section className="aspect-video w-full overflow-hidden rounded-lg shadow">
                        <iframe
                            src={currentModule.resources.video}
                            title={`${currentModule.title} video`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                        />
                    </section>
                )}

                {/* Objectives */}
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold">Learning objectives</h2>
                    <ul className="list-disc pl-5 space-y-1 text-gray-800">
                        {currentModule.objectives.map((obj) => (
                            <li key={obj}>{obj}</li>
                        ))}
                    </ul>
                </section>

                {/* Etiquette table */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Etiquette essentials</h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                        <table className="w-full table-auto divide-y divide-gray-200 text-sm">
                            <tbody className="divide-y divide-gray-200">
                            {currentModule.etiquette.map(([topic, rule]) => (
                                <tr key={topic} className="hover:bg-gray-50">
                                    <th className="w-40 px-4 py-3 text-left font-medium text-gray-700">
                                        {topic}
                                    </th>
                                    <td className="px-4 py-3">{rule}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Guide link */}
                {currentModule.resources?.guide && (
                    <section>
                        <a
                            href={currentModule.resources.guide}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-md bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-700"
                        >
                            Read the full etiquette guide ↗
                        </a>
                    </section>
                )}
            </main>
        </div>
    );
}
