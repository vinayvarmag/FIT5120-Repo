/* File: src/app/modules/[id]/layout.js */
"use client";

import { useParams, usePathname, notFound } from "next/navigation";
import Link from "next/link";
import { modulesById } from "@/lib/learningModules";

export default function ModuleLayout({ children }) {
    /* ── runtime data ───────────────────────────────────────── */
    const { id }   = useParams();
    const path     = usePathname();
    const currentModule   = modulesById[id];
    if (!currentModule) return notFound();

    /* ── sidebar tabs ──────────────────────────────────────── */
    const tabs = [
        ["overview",  "Overview"],
        ["resources", "Resources"],
        ["quiz",      "Quiz"],
    ];

    return (
        <div className="flex min-h-screen bg-white">
            {/* ── left sidebar / module navbar ───────────────────── */}
            <aside
                className="sticky top-16 z-40 flex h-[calc(100vh-4rem)] w-56 flex-col
                   border-r border-gray-200 bg-white px-4 py-6"
            >
                <h1 className="mb-4 text-lg font-semibold">{currentModule.title}</h1>

                <nav className="flex flex-1 flex-col gap-2">
                    {tabs.map(([slug, label]) => {
                        const href   = `/modules/${id}/${slug}`;
                        const active = path === href;
                        return (
                            <Link
                                key={slug}
                                href={href}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors
                  ${active
                                    ? "bg-purple-900 text-white"
                                    : "text-purple-900 hover:bg-purple-100"}`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* ── main page content ──────────────────────────────── */}
            <main className="flex-1 px-6 py-8">{children}</main>
        </div>
    );
}
