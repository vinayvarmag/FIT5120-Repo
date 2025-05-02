"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* how long to wait (ms) before hiding the submenu */
const CLOSE_DELAY = 400;

/* ───────────────────────────────────────── navbar ───────────────────────────────────────── */
export default function Navbar({ version }) {
    /* mobile burger ▸ scroll-hide ▸ submenu */
    const [burgerOpen,    setBurgerOpen]    = useState(false);
    const [hideBar,       setHideBar]       = useState(false);
    const [barPinned,     setBarPinned]     = useState(false);
    const [awarenessOpen, setAwarenessOpen] = useState(false);

    const hideTimer = useRef(null);
    const prevY     = useRef(0);
    const pathname  = usePathname();

    /* scroll-hide logic (unchanged) */
    useEffect(() => {
        const onScroll = () => {
            const y     = window.scrollY;
            const delta = y - prevY.current;
            if (!barPinned) {
                if (delta > 10 && y > 120) setHideBar(true);          // scroll down
                if (delta < -10 || y < 120) setHideBar(false);        // scroll up / top
            }
            prevY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [barPinned]);

    /* version prefix (/iteration1 …) */
    const currentVer = (() => {
        if (version) return version.replace(/^\/|\/$/g, "");
        const first = pathname.split("/")[1];
        return first?.startsWith("iteration") ? first : "";
    })();
    const vPrefix = currentVer ? `/${currentVer}` : "";

    /* helpers */
    const linkCls = (href) =>
        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold ${
            pathname === href
                ? "border-indigo-500 text-black"
                : "border-transparent text-black hover:text-gray-700 hover:border-gray-300"
        }`;

    const mobLinkCls = (href) =>
        `block pl-3 pr-4 py-2 border-l-4 text-base font-bold ${
            pathname === href
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-transparent text-black hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
        }`;

    /* submenu open / close with delay */
    const openAwareness   = () => {
        clearTimeout(hideTimer.current);
        setAwarenessOpen(true);
    };
    const scheduleClose   = () => {
        hideTimer.current = setTimeout(() => setAwarenessOpen(false), CLOSE_DELAY);
    };
    useEffect(() => () => clearTimeout(hideTimer.current), []);

    /* ───────────────────────────── render ───────────────────────────── */
    return (
        <nav
            onMouseEnter={() => setBarPinned(true)}
            onMouseLeave={() => setBarPinned(false)}
            className={`
        fixed top-0 left-0 w-full z-50 bg-white shadow-lg
        transition-transform duration-300
        ${hideBar ? "-translate-y-full" : "translate-y-0"}
      `}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* logo */}
                    <Link href={vPrefix || "/"} className="text-xl font-bold">
                        Divercity
                    </Link>

                    {/* desktop nav */}
                    <div className="hidden sm:flex gap-8 items-center">
                        <Link href={vPrefix || "/"}        className={linkCls(vPrefix || "/")}>Home</Link>
                        <Link href={`${vPrefix}/Games`}    className={linkCls(`${vPrefix}/Games`)}>Games</Link>
                        <Link href={`${vPrefix}/EventPlanner`} className={linkCls(`${vPrefix}/EventPlanner`)}>Culture Event Planner</Link>

                        {/* Culture Awareness dropdown with linger delay */}
                        <div
                            className="relative"
                            onMouseEnter={openAwareness}
                            onMouseLeave={scheduleClose}
                        >
                            <Link href={`${vPrefix}/Awareness`} className={linkCls(`${vPrefix}/Awareness`)}>
                                Culture Awareness ▾
                            </Link>

                            {awarenessOpen && (
                                <div
                                    className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5"
                                    onMouseEnter={openAwareness}
                                    onMouseLeave={scheduleClose}
                                >
                                    <div className="py-1">
                                        <Link href={`${vPrefix}/Awareness/precinct`}  className="block px-4 py-2 text-sm hover:bg-gray-100">Cultural Precinct Exploration</Link>
                                        <Link href={`${vPrefix}/Awareness/modules`}   className="block px-4 py-2 text-sm hover:bg-gray-100">Learning Modules</Link>
                                        <Link href={`${vPrefix}/Awareness/etiquette`} className="block px-4 py-2 text-sm hover:bg-gray-100">Cultural Etiquette Guide</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* mobile burger */}
                    <button onClick={() => setBurgerOpen(!burgerOpen)} className="sm:hidden p-2 rounded-md">
                        <span className="sr-only">Open main menu</span>
                        {burgerOpen ? (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* mobile panel */}
            {burgerOpen && (
                <div className="sm:hidden">
                    <Link href={vPrefix || "/"}            className={mobLinkCls(vPrefix || "/")}>Home</Link>
                    <Link href={`${vPrefix}/Games`}        className={mobLinkCls(`${vPrefix}/Games`)}>Games</Link>
                    <Link href={`${vPrefix}/EventPlanner`} className={mobLinkCls(`${vPrefix}/EventPlanner`)}>Culture Event Planner</Link>

                    <details open className="border-t border-gray-200">
                        <summary className="pl-3 pr-4 py-2 text-base font-bold">Culture Awareness</summary>
                        <div className="space-y-1 bg-gray-50">
                            <Link href={`${vPrefix}/Awareness/precinct`}  className={mobLinkCls(`${vPrefix}/Awareness/precinct`)}>Cultural Precinct Exploration</Link>
                            <Link href={`${vPrefix}/Awareness/modules`}   className={mobLinkCls(`${vPrefix}/Awareness/modules`)}>Learning Modules</Link>
                            <Link href={`${vPrefix}/Awareness/etiquette`} className={mobLinkCls(`${vPrefix}/Awareness/etiquette`)}>Cultural Etiquette Guide</Link>
                        </div>
                    </details>
                </div>
            )}
        </nav>
    );
}
