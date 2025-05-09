// File: src/app/awareness/page.js
"use client";

import Image from "next/image";
import Link   from "next/link";
import { FaMapMarkedAlt, FaBookOpen, FaUsers } from "react-icons/fa";

/* ---------- topics shown in the list ---------- */
const topics = [
    {
        key: "precinct",
        title: "Cultural Precinct Exploration",
        icon: FaMapMarkedAlt,
        description:
            "Explore local cultural precincts through interactive maps and historical insights.",
    },
    {
        key: "modules",
        title: "Learning Modules",
        icon: FaBookOpen,
        description:
            "Engage with structured learning modules covering global traditions, languages, and customs.",
    },
    {
        key: "etiquette",
        title: "Cultural Etiquette Guide",
        icon: FaUsers,
        description:
            "Discover essential etiquette tips for respectful interactions across different cultures.",
    },
];

/* -------------------------------------------------------------------------- */
export default function AwarenessLanding() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* ---------- hero banner ---------- */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                {/* background image */}
                <Image
                    src="/awareness.jpg"  /* place the file in /public */
                    alt="Hand tossing a globe in front of mountain cliffs"
                    fill
                    priority
                    className="object-cover object-center"
                />
                {/* dark overlay */}
                <div className="absolute inset-0 bg-black/20" />
                {/* title overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center mb-12">
                        Culture Awareness
                    </h1>
                    <p className="text-center max-w-3xl text-white text-xl font-semibold">
                        Gain a deeper understanding of the world’s cultural richness through immersive
                        content and practical insights. Explore real places, learn, and discover how
                        traditions and customs shape everyday life in classrooms.
                    </p>
                </div>

            </section>

            {/* ---------- introductory copy ---------- */}
            <section className="flex flex-col items-center px-4 py-12">

                <p className="text-center max-w-3xl  font-bold text-black text-xl mb-6">
                    Select a topic below to explore!
                </p>

                {/* ---------- topic cards ---------- */}
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {topics.map(({ key, title, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={`/Awareness/${key}`}
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
