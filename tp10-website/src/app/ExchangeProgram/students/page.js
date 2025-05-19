// File: src/app/student-exchange/page.js
"use client";

import Image from "next/image";

export default function StudentExchangePage() {
    return (
        <main className="pt-24 min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 space-y-16">

                {/* ── heading ───────────────────────── */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-purple-900">
                        Student Exchange Programs
                    </h1>
                    <p className="text-gray-700">
                        Live overseas, attend a local school and make new friends while you
                        earn credit toward your studies back home.
                    </p>
                </header>

                {/* ── CARD 1 – Student Exchange Australia / NZ ── */}
                <a
                    href="https://studentexchange.org.au/programs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                >
                    {/* image + copyright */}
                    <div className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0">
                        <Image
                            src="https://studentexchange.org.au/wp-content/uploads/sites/7/2023/09/SEANZ-640x480-6.jpg"
                            alt="Student Exchange Australia New Zealand – students smiling"
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        {/* copyright tag */}
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
              © Student Exchange Australia NZ
            </span>
                    </div>

                    {/* text */}
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-purple-900 group-hover:underline">
                            Student Exchange Australia New Zealand
                        </h2>
                        <p className="text-sm text-gray-700">
                            Registered not‑for‑profit offering classic and short‑term high‑school
                            exchanges in 20 + destinations.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li>Stay 2–3 months, a semester (4–6 mths) or a full year (10–12 mths)</li>
                            <li>Live with a caring host family; attend the local high school</li>
                            <li>ISO 9001‑certified quality management & nationwide registration</li>
                            <li>Destinations across the USA, Canada, Europe, Japan & more</li>
                        </ul>
                    </div>
                </a>

                {/* ── CARD 2 – SCCE ──────────────────── */}
                <a
                    href="https://www.thisisscce.com/ca/new-campaign-page-book-a-consultation-2025/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                >
                    {/* image + copyright */}
                    <div className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0">
                        <Image
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=60"
                            alt="SCCE – exchange students enjoying campus life"
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        {/* copyright tag */}
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
              © SCCE / Unsplash
            </span>
                    </div>

                    {/* text */}
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-purple-900 group-hover:underline">
                            Southern Cross Cultural Exchange (SCCE)
                        </h2>
                        <p className="text-sm text-gray-700">
                            Australia’s first not‑for‑profit exchange organisation (founded 1983)
                            with classic & select programs worldwide.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li>Programs from a few weeks to a full academic year</li>
                            <li>15 + destinations – France, Norway, Canada, Italy, UK, Spain & more</li>
                            <li>Free info webinars and obligation‑free consultation calls</li>
                            <li>24/7 support plus local coordinators in each host country</li>
                        </ul>
                    </div>
                </a>
                {/* Card 3 */}
                <a
                    href="https://afs.org.au/study-abroad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                >
                    {/* image + copyright */}
                    <div className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0">
                        <Image
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
                            alt="AFS Australia Study Abroad – student abroad"
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
      © AFS Australia
    </span>
                    </div>

                    {/* text */}
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-purple-900 group-hover:underline">
                            AFS Intercultural Programs Australia
                        </h2>
                        <p className="text-sm text-gray-700">
                            Not-for-profit intercultural exchange organisation offering 4–12 month placements for secondary students, plus short-term volunteering and family programs.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li>Destinations in Europe, Asia, Americas, Africa & Pacific</li>
                            <li>Live with a host family & attend local school</li>
                            <li>Pre-departure training & 24/7 in-country support</li>
                            <li>Scholarships available for eligible students</li>
                        </ul>
                    </div>
                </a>

                {/* ── disclaimer ────────────────────── */}
                <p className="text-center text-xs italic text-gray-500">
                    Information is summarised from provider websites; always confirm
                    program details directly before applying.
                </p>
            </div>
        </main>
    );
}
