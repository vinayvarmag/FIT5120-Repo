"use client";

import Image from "next/image";
import Link from "next/link";
import {
    FaFire,
    FaCalendarAlt,
    FaBookmark,
    FaStar,
} from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/**
 * Event Calendar – landing hub
 *
 * Inspired by the "Culture Awareness" landing page design you shared: hero
 * banner with overlay + a grid of topic cards.  Four cards link to the major
 * subsections: Popular Events, full Event Calendar, My Saved Events, and
 * Favourites.
 *
 * File location:  src/app/introduction/page.js  (adjust route as desired)
 */
export default function EventCalendarLanding() {
    /* --------- cards config --------- */
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

    /* ---------------------------------------------------------------------- */
    return (
        <main className="min-h-screen flex flex-col">
            {/* ---------- hero banner ---------- */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                {/* background image — replace /events_banner.jpg in /public */}
                <Image
                    src="/events_banner.jpg"
                    alt="Collage of festival lights and calendar pages"
                    fill
                    priority
                    className="object-cover object-center"
                />
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/25" />
                {/* title overlay */}
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
                    Explore events from the list of events and add to "My Event" by clicking on the "bookmark" icon. Add an event to the top of your list by selecting the "star" icon.
                </p>

                {/* ---------- section cards ---------- */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {sections.map(({ key, title, href, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={href}
                            className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            {/* icon + title */}
                            <div className="flex-none w-64 flex items-center space-x-4 mr-8">
                                <Icon className="text-4xl text-purple-900" />
                                <h3 className="text-xl font-semibold text-black">{title}</h3>
                            </div>

                            {/* description */}
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