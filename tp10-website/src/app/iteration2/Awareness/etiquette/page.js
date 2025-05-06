/* File: src/app/awareness/etiquette/page.js */
"use client";

export default function CulturalEtiquetteGuide() {
    return (
        <main className="min-h-screen pt-20 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 py-20 space-y-10">
                {/* heading */}
                <header className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-orange-700">
                        Cultural Etiquette Guide
                    </h1>
                    <p className="text-gray-700">
                        Victoria is home to hundreds of cultures, each with its own
                        traditions, greetings and social norms. This page gathers concise
                        etiquette tips so you can interact with respect and confidence.
                        We’re expanding the guide module-by-module—check back regularly!
                    </p>
                </header>

                {/* sample etiquette blurb */}
                <section className="space-y-4 text-sm leading-relaxed text-gray-800 bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold text-orange-700">
                        Quick universal courtesies
                    </h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong>Greetings &amp; titles&nbsp;:</strong> When unsure, use
                            formal titles (e.g.&nbsp;Mr, Ms, Dr) until invited otherwise.
                        </li>
                        <li>
                            <strong>Personal space&nbsp;:</strong> A safe rule is an arm’s
                            length unless the culture specifically favours closer contact,
                            such as cheek-kissing in parts of Europe or Latin America.
                        </li>
                        <li>
                            <strong>Dining&nbsp;:</strong> Wait for the host to start eating
                            or to offer a seat. In some South-East Asian cultures, finishing
                            every last bite may suggest the host didn’t provide enough food.
                        </li>
                        <li>
                            <strong>Shoes&nbsp;:</strong> In many Asian, Middle-Eastern and
                            some European households, shoes are removed at the door—look for
                            a pile of shoes or ask politely.
                        </li>
                        <li>
                            <strong>Photography&nbsp;:</strong> Always ask permission before
                            photographing people, religious sites or ceremonial events.
                        </li>
                    </ul>
                    <p className="pt-2 text-xs italic text-gray-600">
                        Note: these points are broad guidelines. Specific norms vary within
                        communities and families—when in doubt, ask politely.
                    </p>
                </section>

                {/* external resources */}
                <aside className="space-y-3 text-sm">
                    <h2 className="text-center font-medium text-orange-700">
                        Further reading
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <a
                            href="https://www.commisceo-global.com/resources/country-guides"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg bg-white p-4 shadow ring-1 ring-orange-100 hover:bg-orange-50 transition"
                        >
                            Guides to Culture, Customs and Etiquette for&nbsp;80+ Countries
                        </a>

                        <a
                            href="https://culturalatlas.sbs.com.au/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg bg-white p-4 shadow ring-1 ring-orange-100 hover:bg-orange-50 transition"
                        >
                            Countries — Cultural&nbsp;Atlas
                        </a>

                        <a
                            href="https://www.getours.com/expert-travel-advice/history-traditions-celebrations/guide-to-cultural-customs-etiquette-abroad"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg bg-white p-4 shadow ring-1 ring-orange-100 hover:bg-orange-50 transition sm:col-span-2"
                        >
                            Cultural Customs &amp; Etiquette Abroad:&nbsp;A Guide for Respectful Travel&nbsp;| Grand European Travel
                        </a>
                    </div>
                </aside>

                {/* page disclaimer */}
                <p className="text-center text-xs italic text-gray-600">
                    Disclaimer: The cultural information provided here is introductory. Norms
                    evolve and differ across regions, generations, and personal preference.
                    Always approach new interactions with curiosity and respect.
                </p>
            </div>
        </main>
    );
}
