// File: src/app/awareness/etiquette/page.js
"use client";

import Image from "next/image";

/* ── external‑reading cards (image + link) ─────────────── */
const readingItems = [
    {
        src: "/country_guide.jpg",
        alt: "Cow grazing in green alpine pasture",
        href: "https://www.commisceo-global.com/resources/country-guides",
        title: "Guides to Culture, Customs and Etiquette for 80+ Countries",
    },
    {
        src: "/customs.jpg",
        alt: "Collection of cultural masks on pale background",
        href: "https://culturalatlas.sbs.com.au/countries",
        title: "Countries — Cultural Atlas",
    },
    {
        src: "/cultures.jpg",
        alt: "People sharing multicultural meal at a long table",
        href:
            "https://www.getours.com/expert-travel-advice/history-traditions-celebrations/guide-to-cultural-customs-etiquette-abroad",
        title:
            "Cultural Customs & Etiquette Abroad: A Guide for Respectful Travel",
    },
];

export default function CulturalEtiquetteGuide() {
    return (
        <main className="min-h-screen pt-20 px-4 bg-gray-50">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* ─── heading ─────────────────────────────────────── */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-purple-900">
                        Cultural Etiquette Guide
                    </h1>
                    <p className="text-gray-700">
                        Victoria is home to hundreds of cultures, each with its own
                        traditions, greetings and social norms. This page gathers concise
                        etiquette tips so you can interact with respect and confidence.
                        We’re expanding the guide module‑by‑module—check back regularly!
                    </p>
                </header>

                {/* ─── quick courtesies ────────────────────────────── */}
                <section className="space-y-4 text-sm leading-relaxed text-gray-800 bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold text-purple-900">
                        Quick universal courtesies
                    </h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>Greetings &amp; titles:</strong> When unsure, use formal
                            titles (e.g. Mr, Ms, Dr) until invited otherwise.
                        </li>
                        <li>
                            <strong>Personal space:</strong> A safe rule is an arm’s length
                            unless the culture specifically favours closer contact, such as
                            cheek‑kissing in parts of Europe or Latin America.
                        </li>
                        <li>
                            <strong>Dining:</strong> Wait for the host to start eating or to
                            offer a seat. In some South‑East Asian cultures, finishing every
                            last bite may suggest the host didn’t provide enough food.
                        </li>
                        <li>
                            <strong>Shoes:</strong> In many Asian, Middle‑Eastern and some
                            European households, shoes are removed at the door—look for a pile
                            of shoes or ask politely.
                        </li>
                        <li>
                            <strong>Photography:</strong> Always ask permission before
                            photographing people, religious sites or ceremonial events.
                        </li>
                    </ul>
                    <p className="pt-2 text-xs italic text-gray-700">
                        Note: these points are broad guidelines. Specific norms vary within
                        communities and families—when in doubt, ask politely.
                    </p>
                </section>

                {/* ─── further reading (big image cards) ───────────── */}
                <section className="space-y-6">
                    <h2 className="text-center font-medium text-purple-900">
                        Further reading
                    </h2>

                    <div className="space-y-6">
                        {readingItems.map(({ src, alt, href, title }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                            >
                                {/* image (left) */}
                                <Image
                                    src={src}
                                    alt={alt}
                                    width={500}
                                    height={320}
                                    className="w-full sm:w-64 h-56 sm:h-auto object-cover flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* title (right) */}
                                <div className="p-6 flex items-center">
                                    <h3 className="text-lg font-semibold text-purple-900 group-hover:underline">
                                        {title}
                                    </h3>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ─── disclaimer ─────────────────────────────────── */}
                <p className="text-center text-xs italic text-gray-500">
                    Disclaimer: The cultural information provided here is introductory.
                    Norms evolve and differ across regions, generations, and personal
                    preference. Always approach new interactions with curiosity and
                    respect.
                </p>
            </div>
        </main>
    );
}
