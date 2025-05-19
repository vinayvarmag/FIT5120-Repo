"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FaFire, FaCalendarAlt, FaBookmark } from "react-icons/fa";
import { RiBookmarkLine, RiStarLine } from "react-icons/ri";

/* -------------------------------------------------------------------------- */
/**
 * Event Calendar – landing hub
 *
 * Requires authentication: if not logged in, redirects user to login prompt.
 */
export default function EventCalendarLanding() {
    const { user } = useAuth();

    // show loading while auth status is resolving
    if (user === undefined) {
        return (
            <main className="min-h-screen bg-gray-50 text-black pt-24 flex items-center justify-center">
                <p>Loading…</p>
            </main>
        );
    }

    // if not authenticated, prompt login
    if (!user) {
        return (
            <main className="min-h-screen bg-gray-50 text-black pt-24 flex items-center justify-center">
                <p>
                    Please{' '}
                    <Link href="/login" className="underline">
                        log in
                    </Link>{' '}
                    to view the Event Calendar.
                </p>
            </main>
        );
    }

    // authenticated: render landing content
    const sections = [
        {
            key: "popular",
            title: "Popular Events",
            href: "/EventCalendar/popular",
            icon: FaFire,
            description:
                "Browse the events that are trending across the community right now.",
        },
        {
            key: "all",
            title: "Event Calendar",
            href: "/EventCalendar/Calendar",
            icon: FaCalendarAlt,
            description:
                "See every upcoming event you have access to, neatly organised by date.",
        },
        {
            key: "saved",
            title: "My Saved Events",
            href: "/EventCalendar/saved",
            icon: FaBookmark,
            description:
                "Quickly jump back to events you’ve bookmarked to keep an eye on.",
        },
    ];

    return (
        <main className="min-h-screen flex flex-col">
            {/* ---------- hero banner ---------- */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                <Image
                    src="/events_banner.jpg"
                    alt="Collage of festival lights and calendar pages"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-12">
                        Event Calendar
                    </h1>
                    <p className="text-center max-w-3xl text-white text-xl font-semibold">
                        This is an all-in-one cultural calendar. Easily keep track of saved or planned events, and browse public holidays from around the world to better organize cultural activities and personal schedules.
                    </p>
                </div>
            </section>

            {/* ---------- introductory copy ---------- */}
            <section className="flex flex-col items-center px-4 py-12">
                <p className="text-center max-w-3xl font-bold text-black text-xl mb-6">
                    Explore events from the list and add to <strong>My Events</strong> by clicking the{' '}
                    <RiBookmarkLine className="inline align-middle mx-1" size={20} /> icon. Add an event
                    to the top of your list by selecting the{' '}
                    <RiStarLine className="inline align-middle mx-1" size={20} /> icon.
                </p>

                {/* ---------- section cards ---------- */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {sections.map(({ key, title, href, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={href}
                            className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className="flex-none w-64 flex items-center space-x-4 mr-8">
                                <Icon className="text-4xl text-purple-900" />
                                <h3 className="text-xl font-semibold text-black">{title}</h3>
                            </div>
                            <div className="flex-1">
                                <p className="text-black">{description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
