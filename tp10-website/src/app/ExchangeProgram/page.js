// File: src/app/exchange/page.js
"use client";

import Image from "next/image";
import Link  from "next/link";
import { useEffect, useState } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

/* ─── landing cards ─── */
const cards = [
    {
        key: "teachers",
        title: "For Teachers",
        icon:  FaChalkboardTeacher,
        description:
            "Resources, guidelines, and application steps for educators coordinating or leading exchange programs.",
    },
    {
        key: "students",
        title: "For Students",
        icon:  FaUserGraduate,
        description:
            "Everything students need to prepare, apply, and thrive in an international exchange experience.",
    },
];

export default function ExchangeProgramsLanding() {
    /* ── converter state ── */
    const [rates, setRates]           = useState({});
    const [codes, setCodes]           = useState([]);
    const [amountAUD, setAmountAUD]   = useState(1);
    const [target, setTarget]         = useState("USD");
    const [converted, setConverted]   = useState("");
    const [loading, setLoading]       = useState(true);

    const apiKey = process.env.NEXT_PUBLIC_FREE_CURRENCY_API_KEY;

    /* ── single API call: latest rates with AUD base ── */
    useEffect(() => {
        if (!apiKey) {
            console.error("Missing FREE_CURRENCY_API_KEY");
            setLoading(false);
            return;
        }
        (async () => {
            try {
                const res  = await fetch(
                    //`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=AUD`
                );
                const json = await res.json();
                const audRates = json.data || {};

                // Ensure AUD appears explicitly
                audRates.AUD = 1;

                setRates(audRates);
                setCodes(Object.keys(audRates));
                // Keep default target valid
                if (!audRates[target]) setTarget("USD");
            } catch (err) {
                console.error("Failed to load FX rates", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [apiKey]);

    /* ── recalc on changes ── */
    useEffect(() => {
        if (!loading && rates[target] != null && !Number.isNaN(amountAUD)) {
            setConverted((amountAUD * rates[target]).toFixed(2));
        }
    }, [amountAUD, target, rates, loading]);

    return (
        <main className="min-h-screen flex flex-col">
            {/* ── Hero ── */}
            <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
                <Image
                    src="/exchange.jpg"
                    alt="Students holding international flags on campus"
                    fill
                    priority
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-10">
                        Exchange Programs
                    </h1>
                    <p className="max-w-3xl text-white text-xl font-semibold">
                        Interested in studying, volunteering, or gaining experience abroad? Explore opportunities, check
                        eligibility, and read real stories from past participants.
                    </p>
                </div>
            </section>

            {/* ── Description ── */}
            <section className="px-4 py-4">
                <h2 className="text-2xl font-semibold text-center mb-2">Currency Converter</h2>
                <p className="text-center max-w-2xl mx-auto text-gray-700">
                    Use this tool to instantly convert Australian Dollars (AUD) into any supported currency using live
                    exchange rates. Simply enter the amount in AUD, select your desired currency, and view the
                    converted total.
                </p>
            </section>

            {/* ── Currency converter ── */}
            <section className="flex justify-center px-4 py-12">
                <div className="w-full max-w-2xl rounded-xl shadow p-6">
                    <div className="flex space-x-4">
                        {/* AUD input */}
                        <div className="flex-1 bg-white rounded-lg border flex items-center p-3">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amountAUD}
                                onChange={e => setAmountAUD(Number(e.target.value))}
                                className="w-full text-lg outline-none"
                            />
                            <select
                                value="AUD"
                                disabled
                                className="ml-2 bg-transparent outline-none cursor-not-allowed"
                            >
                                <option>AUD</option>
                            </select>
                        </div>

                        {/* Converted output */}
                        <div className="flex-1 bg-white rounded-lg border flex items-center p-3">
                            <input
                                type="text"
                                value={converted}
                                readOnly
                                placeholder={loading ? "Loading..." : "0.00"}
                                className="w-full text-lg outline-none"
                            />
                            <select
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                                disabled={loading}
                                className="ml-2 bg-transparent outline-none cursor-pointer"
                            >
                                {loading ? (
                                    <option>Loading currencies...</option>
                                ) : (
                                    codes.sort().map(code => (
                                        <option key={code} value={code}>{code}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Intro & cards ── */}
            <section className="flex flex-col items-center px-4 py-12">
                <p className="text-center max-w-3xl font-semibold text-black mb-6">
                    Interested in studying, volunteering, or gaining experience abroad?
                </p>
                <p className="text-center max-w-3xl text-black mb-10">
                    Start here. Explore international exchange opportunities, learn about partner institutions, and
                    prepare for an exciting cross-cultural journey.
                </p>

                <div className="flex flex-col gap-6 w-full max-w-4xl">
                    {cards.map(({ key, title, icon: Icon, description }) => (
                        <Link
                            key={key}
                            href={`/ExchangeProgram/${key}`}
                            className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className="flex-none w-64 flex items-center space-x-4 mr-8">
                                <Icon className="text-4xl text-purple-900" />
                                <h3 className="text-xl font-semibold text-black">{title}</h3>
                            </div>
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
