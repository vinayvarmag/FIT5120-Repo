// File: src/app/modules/[id]/layout.js

"use client";

import React from "react";
import { modulesById } from "@/lib/learningModules";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import { getProgress } from "@/utils/progress";
import { useEffect, useState } from "react";

export default function ModuleLayout({ children, params }) {
    // Unwrap the promised params object
    const { id } = React.use(params);

    const currentModule = modulesById[id];
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setProgress(getProgress(id));
    }, [id, pathname]);

    if (!currentModule) return <div className="p-10">Module not found</div>;

    const tabs = ["overview", "objectives", "etiquette", "resources"];
    const currentTab = pathname.split("/").pop();
    const currentIndex = tabs.indexOf(currentTab);

    const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
    const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-orange-100/60">
            <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{currentModule.title}</h1>
                    <ProgressBar value={progress} />
                    <p className="text-sm text-gray-700">{progress}% completed</p>
                </div>

                {/* Tab nav */}
                <nav className="flex gap-4">
                    {tabs.map((tab) => {
                        const active = pathname.endsWith(`/${tab}`);
                        return (
                            <Link
                                key={tab}
                                href={`/modules/${id}/${tab}`}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                                    active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Link>
                        );
                    })}
                </nav>

                {/* Page content */}
                {children}

                {/* Prev / Next navigation */}
                <div className="flex justify-between mt-8">
                    {prevTab ? (
                        <Link href={`/modules/${id}/${prevTab}`}>
                            <button className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
                                ← {prevTab.charAt(0).toUpperCase() + prevTab.slice(1)}
                            </button>
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextTab ? (
                        <Link href={`/modules/${id}/${nextTab}`}>
                            <button className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
                                {nextTab.charAt(0).toUpperCase() + nextTab.slice(1)} →
                            </button>
                        </Link>
                    ) : (
                        <Link href="/Awareness">
                            <button className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                                Complete & Return
                            </button>
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
