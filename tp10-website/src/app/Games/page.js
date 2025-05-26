/* File: src/app/Games/page.js */
"use client";

import React from "react";
import Image from "next/image";
import Link  from "next/link";
import { FaGamepad, FaMicrophone } from "react-icons/fa";

export default function GamesLanding() {
    const games = [
        {
            key: "quiz",
            title: "Cultural Quiz",
            href:  "/Games/QuizHost",
            icon:  FaGamepad,
            description:
                "Select a category for the quiz and the number of questions you would like students to answer. The count down per question will be 10 seconds.",
        },
        {
            key: "pronunciation",
            title: "Pronunciation Challenge",
            href:  "/Games/Pronunciation",
            icon:  FaMicrophone,
            description:
                "Start the game by allowing the website to your microphone, typing in the \"word\" to test, and reading out the pronunciation of the word.",
        },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-white">
            {/* ── hero ───────────────────────────────────── */}
            <section className="relative w-full h-[300px] md:h-[460px] lg:h-[540px]">
                <Image
                    src="/assets/students_hallway.png"
                    alt="Friends playing a game together"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg">
                        Games
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg md:text-xl font-semibold text-white text-center">
                        This is an all-in-one cultural playground. Choose a game, play
                        solo or host a room, and discover something new while you’re at it.
                    </p>
                </div>
            </section>

            {/* ── intro banner ───────────────────────────── */}
            <section className="flex flex-col items-center px-4 py-10">
                <p className="max-w-4xl text-center font-bold text-black text-lg md:text-xl">
                    Teachers can invite students to join the lobby through the QR code or invitation link. After students join, the teacher can start the game from their side.
                </p>
            </section>

            {/* ── game cards ─────────────────────────────── */}
            <section className="flex flex-col items-center px-4 pb-20">
                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {games.map(({ key, title, href, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={href}
                            className="flex items-start gap-6 w-full
                                       rounded-lg border border-gray-200
                                       px-6 py-5 shadow-sm hover:shadow-md transition"
                        >
                            {/* left block (fixed width) */}
                            <div className="flex items-center gap-4 basis-60">
                                <Icon className="text-4xl text-purple-900 shrink-0" />
                                <h3 className="text-xl md:text-2xl font-bold text-black">
                                    {title}
                                </h3>
                            </div>

                            {/* right block (flex-grow) */}
                            <p className="text-black/80 flex-1">
                                {description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
