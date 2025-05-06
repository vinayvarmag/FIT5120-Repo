/* File: src/app/modules/[id]/layout.js */
"use client";

import { useParams, usePathname, notFound } from "next/navigation";
import Link                                from "next/link";
import { modulesById }                     from "@/lib/learningModules";

export default function ModuleLayout({ children }) {
    const params   = useParams();
    const pathname = usePathname();

    const id            = params.id;
    const currentModule = modulesById[id];
    if (!currentModule) return notFound();

    const tabs = [
        ["overview",   "Overview"],
        ["objectives", "Objectives"],
        ["resources",  "Resources"],
        ["quiz",       "Quiz"],
    ];

    return (
        <div className="min-h-screen w-full bg-white">
            {/* module header (offset so it sits under the main navbar) */}
            <header className="sticky top-20 z-30 bg-white/80 backdrop-blur">
                {/*  ⬆ removed `border-b`  */}
                <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-4">
                    <h1 className="text-2xl font-bold text-purple-600">
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
                                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors  ${
                                        active
                                            ? "bg-purple-500 text-white"
                                            : "bg-purple-50 bg-purple-900 text-white hover:bg-purple-100"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* page content */}
            <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
        </div>
    );
}
