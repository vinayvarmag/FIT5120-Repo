// File: src/app/modules/[id]/overview/page.js
"use client";

import React from "react";
import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";

export default function OverviewPage({ params }) {
    const currentModule = modulesById[params.id];
    if (!currentModule) return notFound();

    const {
        overview,
        objectives,
        resourcesDescription,
        resources,
        quizDescription
    } = currentModule;

    return (
        <div className="prose mx-auto px-4 py-10">
            {/* Overview Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                {Array.isArray(overview) ? (
                    overview.map((line, idx) => <p key={idx}>{line}</p>)
                ) : (
                    <p>{overview}</p>
                )}
            </section>

            {/* Objectives Section */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Objectives</h2>
                {Array.isArray(objectives) ? (
                    <ul className="list-disc list-inside">
                        {objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                        ))}
                    </ul>
                ) : (
                    <p>{objectives}</p>
                )}
            </section>

            {/* Resources Section */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Resources</h2>
                <p>{resourcesDescription}</p>

                {resources?.articles && resources.articles.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-medium">Articles</h3>
                        <ul className="list-disc list-inside">
                            {resources.articles.map((a, idx) => (
                                <li key={idx}>
                                    <a
                                        href={a.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {a.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {resources?.videos && resources.videos.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-medium">Videos</h3>
                        <ul className="list-disc list-inside">
                            {resources.videos.map((v, idx) => (
                                <li key={idx}>
                                    <a
                                        href={v.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {v.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Quiz Section */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Quiz</h2>
                <p>{quizDescription}</p>
            </section>
        </div>
    );
}
