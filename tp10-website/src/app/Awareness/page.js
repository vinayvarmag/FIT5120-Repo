// File: src/app/awareness/page.js
"use client";

import Image from "next/image";
import Link from "next/link";

/* ---------- topics shown in the list ---------- */
const topics = [
    {
        key: "precinct",
        title: "Cultural Precinct Exploration",
        imageSrc: "/images/precinct.jpg",
        description:
            "Explore local cultural precincts through interactive maps and historical insights.",
    },
    {
        key: "modules",
        title: "Learning Modules",
        imageSrc: "/images/modules.jpg",
        description:
            "Engage with structured learning modules covering global traditions, languages, and customs.",
    },
    {
        key: "etiquette",
        title: "Cultural Etiquette Guide",
        imageSrc: "/images/etiquette.jpg",
        description:
            "Discover essential etiquette tips for respectful interactions across different cultures.",
    },
];

export default function AwarenessLanding() {
    return (
        <main className="flex flex-col">
            {/* ---------- hero banner ---------- */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                <Image
                    src="/awareness.jpg"
                    alt="Hand tossing a globe in front of mountain cliffs"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 space-y-4 text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">
                        Cultural Awareness
                    </h1>
                    <p className="max-w-2xl text-white text-base md:text-lg">
                        Gain a deeper understanding of the world’s cultural richness through immersive content and practical insights. Explore real places, learn, and discover how traditions and customs shape everyday life.
                    </p>
                </div>
            </section>

            {/* ---------- introductory copy ---------- */}
            <section className="bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <p className="text-center text-gray-800 font-medium text-lg">
                        Navigate through the “Cultural Awareness” tab to understand Australia’s demographics through precinct exploration, enhance cultural knowledge via learning modules, and master cross-cultural etiquette.
                    </p>
                </div>
            </section>

            {/* ---------- topic cards ---------- */}
            <section className="py-8 px-4">
                <div className="max-w-4xl mx-auto grid gap-8">
                    {topics.map(({ key, title, imageSrc, description }) => (
                        <Link
                            key={key}
                            href={`/Awareness/${key}`}
                            className="group flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                        >
                            {/* image on left */}
                            <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
                                <Image
                                    src={imageSrc}
                                    alt={title}
                                    fill
                                    className="object-cover transform transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            {/* title and description on right */}
                            <div className="p-6 flex flex-col justify-center">
                                <h3 className="text-xl md:text-2xl font-semibold text-purple-900 transition-colors ">
                                    {title}
                                </h3>
                                <p className="mt-2 text-gray-600">{description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
