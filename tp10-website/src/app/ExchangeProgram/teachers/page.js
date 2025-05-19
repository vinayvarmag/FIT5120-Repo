"use client";

import Image from "next/image";

export default function ExchangeProgramPage() {
    return (
        <main className="pt-24 min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 space-y-16">

                {/* ── heading ───────────────────────── */}
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-purple-900">
                        Teacher Exchange Programs
                    </h1>
                    <p className="text-gray-700">
                        Looking to gain international classroom experience, earn a salary
                        and grow professionally? Discover programs that let qualified (or
                        soon-to-be-qualified) teachers live and teach abroad.
                    </p>
                </header>

                {/* ── Global Work & Travel card ──── */}
                <a
                    href="https://www.globalworkandtravel.com/teach-abroad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                >
                    {/* image + overlay */}
                    <div className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0">
                        <Image
                            src="https://res.cloudinary.com/gwatco/image/upload/dpr_auto/t_banner-lg/f_auto/v1746057600/website/division/teach/banner.jpg"
                            alt="Teaching overseas with Global Work & Travel"
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            priority
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
              © Global Work & Travel
            </span>
                    </div>

                    {/* text */}
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-purple-900 group-hover:underline">
                            Global Work & Travel – Teach Abroad & Exchange
                        </h2>
                        <p className="text-sm text-gray-700">
                            Complete a 3–4-week TEFL/TESOL course, then step into a paid
                            teaching placement almost anywhere in the world. The package
                            covers visa guidance, accommodation, airport transfers and a
                            dedicated Trip Coordinator, so you can focus on teaching and
                            exploring.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li>No prior experience required for fluent English speakers</li>
                            <li>Internationally-recognised TEFL/TESOL certificate</li>
                            <li>Job-matching support & in-country partners</li>
                            <li>Salaried roles in 20 + destinations worldwide</li>
                        </ul>
                    </div>
                </a>

                {/* ── Asialink Study Asia card ────── */}
                <a
                    href="https://asialink.unimelb.edu.au/education/program/study-asia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-purple-100 hover:shadow-2xl transition"
                >
                    {/* image + overlay */}
                    <div className="relative w-full sm:w-64 h-56 sm:h-auto flex-shrink-0">
                        <Image
                            src="https://assets.asialink.unimelb.edu.au/2024-08/22-study-tour-Korea-2017.jpg"
                            alt="Study program to Asia by Asialink Education"
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
              © Asialink Education
            </span>
                    </div>

                    {/* text */}
                    <div className="p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-purple-900 group-hover:underline">
                            Asialink Education – Study Program to Asia
                        </h2>
                        <p className="text-sm text-gray-700">
                            Asialink Education offers customised professional learning
                            opportunities in Asia for Australian primary and secondary school
                            teachers and school leaders, aligned with the Australian Curriculum.
                        </p>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                            <li>Direct in-country experience in multiple Asian destinations</li>
                            <li>Customisable programs for various curriculum areas</li>
                            <li>Partnerships with education jurisdictions and institutions</li>
                            <li>Focused on meaningful cultural engagement</li>
                        </ul>
                    </div>
                </a>


                {/* ── disclaimer ────────────────────── */}
                <p className="text-center text-xs italic text-gray-500">
                    Info summarised from Global Work & Travel’s and Asialink Education’s public materials; confirm details directly with them before booking.
                </p>
            </div>
        </main>
    );
}
