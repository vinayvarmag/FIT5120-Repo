// File: src/app/events/page.js
"use client";

import Image from "next/image";
import Link   from "next/link";
import { FaPlus, FaRegCalendarAlt } from "react-icons/fa";

/* ---------- actions shown in the list ---------- */
const actions = [
    {
        key: "create",
        title: "Create Event",
        icon: FaPlus,
        description:
            "Plan a new event in seconds. Set a date, venue, budget and more—all in one place.",
        href: "/events/create",      // adjust if your form route is different
    },
    {
        key: "calendar",
        title: "View Events",
        icon: FaRegCalendarAlt,
        description:
            "See every event you’ve planned in a beautiful calendar view and make quick edits.",
        href: "/events/view",           // adjust if your listing route is different
    },
];

/* -------------------------------------------------------------------------- */
export default function EventsLanding() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* ---------- hero banner ---------- */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                {/* background image */}
                <Image
                    src="/events_hero.jpg"
                    alt="People collaborating at a workshop"
                    fill
                    priority
                    className="object-cover object-center"
                />
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/25" />
                {/* title overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-12">
                        Events Hub
                    </h1>
                    <p className="text-center max-w-3xl text-white text-xl font-semibold">
                        Organise, track and celebrate your activities with a simple yet powerful
                        event‑management workflow.
                    </p>
                </div>
            </section>

            {/* ---------- introductory copy ---------- */}
            <section className="flex flex-col items-center px-4 py-12">
                <p className="text-center max-w-3xl font-bold text-black text-xl mb-6">
                    Choose an action to get started!
                </p>

                {/* ---------- action cards ---------- */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {actions.map(({ key, title, icon: Icon, description, href }) => (
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
