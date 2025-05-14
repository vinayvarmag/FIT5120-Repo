// File: src/app/exchange/page.js
"use client";

import Image from "next/image";
import Link   from "next/link";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

/* ─── cards shown on the landing page ─── */
const cards = [
    {
        key: "teachers",
        title: "For Teachers",
        icon: FaChalkboardTeacher,
        description:
            "Resources, guidelines, and application steps for educators coordinating or leading exchange programs.",
    },
    {
        key: "students",
        title: "For Students",
        icon: FaUserGraduate,
        description:
            "Everything students need to prepare, apply, and thrive in an international exchange experience.",
    },
];

/* -------------------------------------------------------------------------- */
export default function ExchangeProgramsLanding() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* ── hero banner ── */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                {/* background image */}
                <Image
                    src="/exchange.jpg"   /* add an image in /public */
                    alt="Students holding international flags on campus"
                    fill
                    priority
                    className="object-cover object-center"
                />
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/30" />
                {/* title + tagline */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-10">
                        Exchange Programs
                    </h1>
                    <p className="max-w-3xl text-white text-xl font-semibold">
                        Interested in studying, volunteering, or gaining experience abroad? This is your starting point. Explore international exchange opportunities, learn about partner institutions, check eligibility and timelines, and read real stories from past participants to help you prepare for your own cross-cultural journey.
                    </p>
                </div>
            </section>

            {/* ── intro copy ── */}
            <section className="flex flex-col items-center px-4 py-12">
                <p className="text-center max-w-3xl font-semibold text-black mb-6">
                    Interested in studying, volunteering, or gaining experience abroad?
                </p>
                <p className="text-center max-w-3xl text-black mb-6">
                    Start here. Explore international exchange opportunities, learn about partner institutions, check eligibility and timelines, and read real stories from past participants to prepare for an exciting cross-cultural journey.
                </p>


                {/* ── cards ── */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {cards.map(({ key, title, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={`/ExchangeProgram/${key}`}
                            className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            {/* icon + title */}
                            <div className="flex-none w-64 flex items-center space-x-4 mr-8">
                                <Icon className="text-4xl text-purple-900" />
                                <h3 className="text-xl font-semibold text-black">
                                    {title}
                                </h3>
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
