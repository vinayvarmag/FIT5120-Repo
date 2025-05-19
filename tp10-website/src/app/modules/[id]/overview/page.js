// File: src/app/modules/[id]/overview/page.js
"use client";

import React from "react";
import { notFound } from "next/navigation";
import { modulesById } from "@/lib/learningModules";

// Static resource table per module
const resourcesTable = {
    "global-icons": [
        { country: "United States", title: "Top 10 Iconic and Famous Americans", url: "https://www.youtube.com/watch?v=yIX5DLZYuFo", author: "WatchMojo.com" },
        { country: "", title: "周杰倫 Jay Chou【粉色海洋 Pink Ocean】Official MV", url: "https://www.youtube.com/watch?v=F_dGEjzRG_Y", author: "周杰倫 Jay Chou" }
    ],
    "traditional-arts": [
        { country: "Australia", title: "Aboriginal Art and Culture in the Territory", url: "https://www.youtube.com/watch?v=d0WfqQAbV0o", author: "Tourism NT" },
        { country: "India", title: "Crafted in India: Meet the makers | Google Arts & Culture", url: "https://www.youtube.com/watch?v=zfTsTMj2z6U", author: "Google Arts & Culture" },
        { country: "Vietnam", title: "Crafts of Vietnam", url: "https://www.youtube.com/watch?v=Lm-ikxQi-Ls", author: "Vietnam Tourism Board" },
        { country: "China", title: "The art of chinese CRAFTS | Google Arts & Culture", url: "https://www.youtube.com/watch?v=-Cdz63P6Q8E", author: "Google Arts & Culture" },
        { country: "United Kingdom", title: "Step into ENGLAND's STORY | Google Arts & Culture", url: "https://www.youtube.com/watch?v=HxiQyqsMszA", author: "Google Arts & Culture" },
        { country: "Malaysia", title: "6 Of The Traditional Arts, Crafts And Trades In Malaysia - Creative Holidays India", url: "https://www.youtube.com/watch?v=DhcGAJ_Zgts", author: "FlyCreative Global Holidays" }
    ],
    "cultural-festivals": [
        { country: "Japan", title: "NEVER MISS Festivals if you go to Japan! | 5 Festivals in Japan", url: "https://www.youtube.com/watch?v=UMxvNGreWGk", author: "Matsu Sama" },
        { country: "Australia", title: "7 Fascinating Festivals in Australia You Won't Want to Miss | Amazing Journeys", url: "https://www.youtube.com/watch?v=luio6c8MaUU", author: "Amazing Journeys" },
        { country: "United States", title: "Top 10 American Festivals You Need to Attend", url: "", author: "Uncover" },
        { country: "China", title: "Chinese Festival Day", url: "https://www.youtube.com/watch?v=tkCrwWnIeIg", author: "National Museum of Australia" },
        { country: "Russia", title: "5 Biggest Festivals in Russia", url: "https://www.youtube.com/watch?v=9PB1Fi976rQ", author: "Learn Russian with RussianPod101.com" },
        { country: "India", title: "Festival of Colors - World's BIGGEST color party", url: "https://www.youtube.com/watch?v=Hh-o5g4tLVE", author: "devinsupertramp" },
        { country: "Vietnam", title: "How the Vietnamese prepare for Tet Festival | Exotic Voyages", url: "https://www.youtube.com/watch?v=iAFInUUr8vA", author: "Exotic Voyages" }
    ],
    "world-dishes": [
        { country: "United Kingdom", title: "Top 10 Greatest British Foods Dishes", url: "https://www.youtube.com/watch?v=AzlpGl3meKY", author: "WatchMojoUK" },
        { country: "India", title: "Everything You Need to Know About Indian Cuisine | Food Network", url: "https://www.youtube.com/watch?v=fsirryKyBN8U", author: "Food Network" },
        { country: "Vietnam", title: "The Art of Vietnamese Cuisine", url: "https://www.youtube.com/watch?v=obRDCiSwjCs", author: "PSK Creative" },
        { country: "China", title: "Shang Palace - The art of Chinese dining", url: "https://www.youtube.com/watch?v=NyFbqpJjzuE", author: "Shangri-La Dubai" },
        { country: "China", title: "Top 10 Most Popular Chinese Foods || Beijing Street Foods || China Traditional Dishes || OnAir24", url: "https://www.youtube.com/watch?v=hiV8ayl6Ypk", author: "OnAir24" },
        { country: "Germany", title: "5 classic German foods you should give a try", url: "", author: "DW Food" },
        { country: "Japan", title: "Top 10 Most Popular Japanese Foods || Tokyo Street Foods || Japan Traditional Foods || OnAir24", url: "https://www.youtube.com/watch?v=EG46NlCo0Eo", author: "OnAir24" },
        { country: "Thailand", title: "Incredible Top 10 Most Popular Thai Foods || Thai Street Foods || Traditional Thailand Cuisine", url: "https://www.youtube.com/watch?v=P8G7T4Trx34", author: "OnAir24" }
    ]
};

export default function OverviewPage({ params }) {
    const currentModule = modulesById[params.id];
    if (!currentModule) return notFound();

    const {
        overview,
        objectives,
        resourcesIntro,
        quizIntro
    } = currentModule;

    // pick matching entries
    const moduleResources = resourcesTable[params.id] || [];

    return (
        <div className="prose mx-auto px-4 py-10">
            {/* Overview */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                {Array.isArray(overview)
                    ? overview.map((line, idx) => <p key={idx}>{line}</p>)
                    : <p>{overview}</p>
                }
            </section>

            {/* Objectives */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Objectives</h2>
                {Array.isArray(objectives)
                    ? <ul className="list-disc list-inside">
                        {objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                    : <p>{objectives}</p>
                }
            </section>

            {/* Resources */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Resources</h2>
                <p>{resourcesIntro}</p>
                {moduleResources.length > 0 && (
                    <table className="w-full table-fixed text-sm">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Country</th>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Author</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {moduleResources.map((res, i) => (
                            <tr key={i} className="border-b">
                                <td className="px-4 py-2">{res.country}</td>
                                <td className="px-4 py-2">
                                    {res.url ? (
                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {res.title}
                                        </a>
                                    ) : res.title}
                                </td>
                                <td className="px-4 py-2">{res.author}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Quiz */}
            <section className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Quiz</h2>
                <p>{quizIntro}</p>
            </section>
        </div>
    );
}
