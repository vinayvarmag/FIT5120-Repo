/* File: src/app/Games/Pronunciation/page.js */
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

const API              = process.env.NEXT_PUBLIC_API_URL;
const WORD_SUGGESTIONS = ["sushi", "samosa", "kimchi", "diwali", "taco"];
const TUT_KEY          = "pronTutSeen-v1";

export default function Pronunciation() {
    /* ─── state ─────────────────────── */
    const [view, setView]           = useState("setup");    // setup ▸ result
    const [word, setWord]           = useState("");
    const [recording, setRec]       = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [result, setResult]       = useState(null);
    const [audioUrl, setAudio]      = useState(null);
    const [ttsUrl, setTts]          = useState(null);

    /* tutorial flag */
    const [showTut, setShowTut] = useState(false);
    useEffect(() => setShowTut(!sessionStorage.getItem(TUT_KEY)), []);
    const dismissTut = () => { sessionStorage.setItem(TUT_KEY, "y"); setShowTut(false); };

    /* record helper */
    const record = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr     = new MediaRecorder(stream, { mimeType: "audio/webm" });
        const chunks = [];
        mr.ondataavailable = e => chunks.push(e.data);
        mr.onstop = async () => {
            const blob  = new Blob(chunks, { type: "audio/webm" });
            const local = URL.createObjectURL(blob);
            setAudio(local);

            const fd = new FormData();
            fd.append("word", word);
            fd.append("wav",  blob, "audio.webm");

            const r = await fetch(`${API}/pronounce`, { method: "POST", body: fd });
            const d = await r.json();
            setResult(d);
            setTts(new URL(d.tts, API).href);
            setRec(false);
            setView("result");
        };
        mr.start(); setRec(true);
        setTimeout(()=>mr.stop(), 2000);
    };

    const beginCountdown = () => {
        let c = 3;
        setCountdown(c);
        const t = setInterval(()=>{
            c -= 1;
            if (c === 0) {
                clearInterval(t);
                setCountdown("Speak!");
                record();
                setTimeout(()=>setCountdown(null), 400);
            } else setCountdown(c);
        },1000);
    };

    /* ─── render ────────────────────── */
    if (view === "setup") {
        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="min-h-screen flex flex-col">
                    <Hero
                        img="/assets/girl_tablet.jpg"
                        title="Pronunciation Challenge"
                        blurb="Type any word, record your voice and get instant accuracy feedback. Improve speaking clarity while having fun."
                    />

                    <section className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto text-center flex-1 bg-gray-50">
                        <input
                            value={word}
                            onChange={e => setWord(e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Enter a word (e.g. samosa)"
                        />

                        <div className="flex flex-wrap justify-center gap-2">
                            {WORD_SUGGESTIONS.map(w=>(
                                <button key={w} onClick={()=>setWord(w)}
                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200">
                                    {w}
                                </button>
                            ))}
                        </div>

                        {countdown !== null && (
                            <p className="text-3xl font-bold">{countdown}</p>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => history.back()}>Back</button>
                            <button onClick={beginCountdown} disabled={recording || word.trim()===""}
                                    className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40">
                                {recording ? "Recording…" : "Start"}
                            </button>
                        </div>
                    </section>
                </main>
            </>
        );
    }

    if (view === "result" && result) {
        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="flex flex-col items-center gap-6 p-6 text-center max-w-md mx-auto">
                    <h2 className="text-2xl font-bold">Result</h2>
                    <p>You said: <code>{result.transcript}</code></p>
                    <p>Accuracy: <b>{result.score}</b></p>
                    <p className={result.pass ? "text-green-600" : "text-red-600"}>
                        {result.pass ? "Great job!" : "Try again!"}
                    </p>

                    {ttsUrl && (
                        <>
                            <p className="font-medium mt-2">Correct pronunciation</p>
                            <audio controls src={ttsUrl} className="w-full border rounded" />
                        </>
                    )}

                    {audioUrl && (
                        <>
                            <p className="font-medium mt-4">Your recording</p>
                            <audio controls src={audioUrl} className="w-full border rounded" />
                        </>
                    )}

                    <button onClick={()=>{ setResult(null); setAudio(null); setTts(null); setView("setup"); }}
                            className="bg-purple-700 text-white px-4 py-2 rounded mt-4">
                        Play again
                    </button>
                </main>
            </>
        );
    }

    return null;
}

/* ─────────────────────────────────────────────────────────────── */
/* inline helpers (no external component files)                    */
/* ─────────────────────────────────────────────────────────────── */
function Hero({ img, title, blurb }) {
    const paragraphs = blurb.split(/\n\s*\n/);
    return (
        <section className="relative w-full h-[300px] md:h-[450px] lg:h-[550px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={title} className="object-cover object-center w-full h-full" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg text-center">{title}</h1>
                {paragraphs.map((p, i) => (
                    <p key={i} className="max-w-3xl text-xl font-semibold text-center text-white">{p}</p>
                ))}
            </div>
        </section>
    );
}

function TutorialOverlay({ dismiss }) {
    return (
        <div onClick={dismiss} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div onClick={(e)=>e.stopPropagation()}
                 className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
                <h2 className="text-xl font-bold">How the games work</h2>
                <ol className="list-decimal pl-4 space-y-1 text-sm">
                    <li><b>Pronunciation:</b> press <kbd>Start</kbd>, speak when prompted.</li>
                    <li><b>Quiz:</b> each question allows 20&nbsp;s. Watch the purple bar!</li>
                    <li><b>Scores:</b> instant feedback after every action; totals at the end.</li>
                </ol>
                <button onClick={dismiss}
                        className="w-full bg-purple-700 text-white px-4 py-2 rounded">
                    Got it – let&rsquo;s play!
                </button>
            </div>
        </div>
    );
}
