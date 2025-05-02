/* File: src/app/modules/[id]/layout.js */
"use client";

import { useParams, usePathname, notFound } from "next/navigation";
import Link                                from "next/link";
import { modulesById }                     from "@/lib/learningModules";

export default function ModuleLayout({ children }) {
    /* ── hooks: always run, no conditionals ── */
    const params    = useParams();
    const pathname  = usePathname();     // moved above the guard

    /* look up module */
    const id            = params.id;
    const currentModule = modulesById[id];

    /* guard AFTER hooks */
    if (!currentModule) return notFound();

    /* tab config */
    const tabs = [
        ["overview",   "Overview"],
        ["objectives", "Objectives"],
        ["resources",  "Resources"],
        ["quiz",       "Quiz"]
    ];

    /* ── render ── */
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
            {/* header */}
            <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-4">
                    <h1 className="text-2xl font-bold text-orange-700">
                        {currentModule.title}
                    </h1>

                    <nav className="flex gap-3">
                        {tabs.map(([slug, label]) => {
                            const href   = `/modules/${currentModule.id}/${slug}`;
                            const active = pathname === href;

                            return (
                                <Link
                                    key={slug}
                                    href={href}
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                        active
                                            ? "bg-orange-600 text-white"
                                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* routed content */}
            <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
        </div>
    );
}
