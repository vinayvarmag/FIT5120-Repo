"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/* how long to wait (ms) before hiding the submenu */
const CLOSE_DELAY = 400;

export default function Navbar({ version }) {
    const { user, setUser } = useAuth();
    const [burgerOpen, setBurgerOpen] = useState(false);
    const [hideBar, setHideBar] = useState(false);
    const [barPinned, setBarPinned] = useState(false);
    const [awarenessOpen, setAwarenessOpen] = useState(false);

    const hideTimer = useRef(null);
    const prevY = useRef(0);
    const pathname = usePathname();
    const router = useRouter();

    // scroll hide/show logic
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            const delta = y - prevY.current;
            if (!barPinned) {
                if (delta > 10 && y > 120) setHideBar(true);
                if (delta < -10 || y < 120) setHideBar(false);
            }
            prevY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [barPinned]);

    // fetch current user on mount
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        }
        fetchUser();
    }, []);

    // sign-out handler
    const handleSignOut = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/");
        } catch (err) {
            console.error("Sign out error", err);
        }
    };

    // version prefix logic
    const currentVer = (() => {
        if (version) return version.replace(/^\/|\/$/, "");
        const first = pathname.split("/")[1];
        return first?.startsWith("iteration") ? first : "";
    })();
    const vPrefix = currentVer ? `/${currentVer}` : "";

    // active link detection
    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const linkCls = (href) =>
        `inline-flex items-center px-1 pt-1 border-b-2 text-lg font-semibold ${
            isActive(href)
                ? "border-indigo-500 text-black"
                : "border-transparent text-black hover:text-black hover:border-gray-300"
        }`;

    const mobLinkCls = (href) =>
        `block pl-3 pr-4 py-2 border-l-4 text-lg font-bold ${
            isActive(href)
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-transparent text-black hover:text-black hover:bg-gray-50 hover:border-gray-300"
        }`;

    // submenu open/close
    const openAwareness = () => {
        clearTimeout(hideTimer.current);
        setAwarenessOpen(true);
    };
    const scheduleClose = () => {
        hideTimer.current = setTimeout(() => setAwarenessOpen(false), CLOSE_DELAY);
    };
    useEffect(() => () => clearTimeout(hideTimer.current), []);

    return (
        <nav
            onMouseEnter={() => setBarPinned(true)}
            onMouseLeave={() => setBarPinned(false)}
            className={`fixed top-0 left-0 w-full z-50 bg-white shadow-lg transition-transform duration-300 ${
                hideBar ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* logo */}
                    <Link href={vPrefix || "/"} className="flex items-center gap-2">
                        <Image
                            src="/Logo.png"
                            alt="Divercity Icon"
                            width={55}
                            height={55}
                            className="object-contain"
                        />
                        <Image
                            src="/Divercity.png"
                            alt="Divercity Text"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </Link>

                    {/* desktop nav */}
                    <div className="hidden sm:flex items-center gap-8 ml-auto text-2xl px-8">
                        <Link href={vPrefix || "/"} className={linkCls(vPrefix || "/")}>
                            Home
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={openAwareness}
                            onMouseLeave={scheduleClose}
                        >
                            <Link
                                href={`${vPrefix}/Awareness`}
                                className={linkCls(`${vPrefix}/Awareness`)}
                            >
                                Culture Awareness ▾
                            </Link>

                            {awarenessOpen && (
                                <div
                                    className="absolute left-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5"
                                    onMouseEnter={openAwareness}
                                    onMouseLeave={scheduleClose}
                                >
                                    <div className="py-1">
                                        <Link
                                            href={`${vPrefix}/Awareness/precinct`}
                                            className="block px-4 py-2 text-base hover:bg-gray-100"
                                        >
                                            Cultural Precinct Exploration
                                        </Link>
                                        <Link
                                            href={`${vPrefix}/Awareness/modules`}
                                            className="block px-4 py-2 text-base hover:bg-gray-100"
                                        >
                                            Learning Modules
                                        </Link>
                                        <Link
                                            href={`${vPrefix}/Awareness/etiquette`}
                                            className="block px-4 py-2 text-base hover:bg-gray-100"
                                        >
                                            Cultural Etiquette Guide
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href={`${vPrefix}/Games`} className={linkCls(`${vPrefix}/Games`)}>
                            Games
                        </Link>
                        <Link href={`${vPrefix}/EventCalendar`} className={linkCls(`${vPrefix}/EventCalendar`)}>
                            Event Calendar
                        </Link>
                        <Link href={`${vPrefix}/events`} className={linkCls(`${vPrefix}/events`)}>
                            Event Planner
                        </Link>
                        <Link href={`${vPrefix}/ExchangeProgram`} className={linkCls(`${vPrefix}/ExchangeProgram`)}>
                            Exchange Program
                        </Link>
                        {!user ? (
                            <>
                                <Link href={`${vPrefix}/login`} className={linkCls(`${vPrefix}/login`)}>
                                    Login
                                </Link>
                                <Link href={`${vPrefix}/register`} className={linkCls(`${vPrefix}/signup`)}>
                                    Register
                                </Link>
                            </>
                        ) : (
                            <>
                <span className="inline-flex items-center px-1 pt-1 text-lg font-semibold text-black">
                  {user.id}
                </span>
                                <button
                                    onClick={handleSignOut}
                                    className="inline-flex items-center px-1 pt-1 text-lg font-semibold text-black hover:text-gray-700"
                                >
                                    Sign Out
                                </button>
                            </>
                        )}
                    </div>

                    {/* mobile burger */}
                    <button
                        onClick={() => setBurgerOpen(!burgerOpen)}
                        className="sm:hidden p-2 rounded-md"
                    >
                        <span className="sr-only">Open main menu</span>
                        {burgerOpen ? (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* mobile panel */}
            {burgerOpen && (
                <div className="sm:hidden">
                    <Link href={vPrefix || "/"} className={mobLinkCls(vPrefix || "/")}>
                        Home
                    </Link>
                    <details open className="border-t border-gray-200">
                        <summary className="pl-3 pr-4 py-2 text-lg font-bold">
                            Culture Awareness
                        </summary>
                        <div className="space-y-1 bg-gray-50">
                            <Link
                                href={`${vPrefix}/Awareness/precinct`}
                                className={mobLinkCls(`${vPrefix}/Awareness/precinct`)}
                            >
                                Cultural Precinct Exploration
                            </Link>
                            <Link
                                href={`${vPrefix}/Awareness/modules`}
                                className={mobLinkCls(`${vPrefix}/Awareness/modules`)}
                            >
                                Learning Modules
                            </Link>
                            <Link
                                href={`${vPrefix}/Awareness/etiquette`}
                                className={mobLinkCls(`${vPrefix}/Awareness/etiquette`)}
                            >
                                Cultural Etiquette Guide
                            </Link>
                        </div>
                    </details>
                    <Link href={`${vPrefix}/Games`} className={mobLinkCls(`${vPrefix}/Games`)}>
                        Games
                    </Link>
                    <Link href={`${vPrefix}/EventCalendar`} className={linkCls(`${vPrefix}/EventCalendar`)}>
                        Event Calendar
                    </Link>
                    <Link href={`${vPrefix}/events`} className={mobLinkCls(`${vPrefix}/events`)}>
                        Event Planner
                    </Link>
                    <Link href={`${vPrefix}/ExchangeProgram`} className={linkCls(`${vPrefix}/ExchangeProgram`)}>
                        Exchange Program
                    </Link>
                    {!user ? (
                        <>
                            <Link
                                href={`${vPrefix}/login`}
                                className={mobLinkCls(`${vPrefix}/login`)}
                            >
                                Login
                            </Link>
                            <Link
                                href={`${vPrefix}/register`}
                                className={mobLinkCls(`${vPrefix}/signup`)}
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
              <span className="block pl-3 pr-4 py-2 text-lg font-bold">
                {user.id}
              </span>
                            <button
                                onClick={handleSignOut}
                                className="block w-full text-left pl-3 pr-4 py-2 text-lg font-bold hover:bg-gray-100"
                            >
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
