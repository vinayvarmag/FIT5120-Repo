/* File: src/app/Games/QuizHost/page.js */
"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import io from "socket.io-client";

/* ─── runtime constants ─────────────────────────────── */
const API         = process.env.NEXT_PUBLIC_API_URL;
const PER_Q_SEC   = 20;
const CAT_OPTIONS = [
    "flags", "food", "festival", "music",
    "landmarks", "clothing", "language", "sports",
];
const TUT_KEY     = "quizTutSeen-v1";
const QRCode      = lazy(() => import("react-qr-code"));

export default function QuizHost() {
    /* ─── state ────────────────────────────────────────── */
    const [view, setView]         = useState("setup");   // setup ▸ lobby ▸ play ▸ end
    const [cats, setCats]         = useState([]);
    const [n, setN]               = useState(4);
    const [sid, setSid]           = useState("");
    const [teams, setTeams]       = useState({});
    const [qs, setQs]             = useState([]);
    const [idx, setIdx]           = useState(0);

    const sockRef = useRef(null);

    /* ─── sockets ──────────────────────────────────────── */
    useEffect(() => {
        sockRef.current = io(API, { transports: ["websocket"] });
        const s = sockRef.current;

        const onState = d => {
            setTeams(d.teams);
            setQs(d.questions);
            setIdx(d.idx);
            if (d.status === "running") setView("play");
            if (d.status === "ended")   setView("end");
        };

        s.on("session_state", onState);
        s.on("error_msg", e => alert(e.msg));

        return () => { s.off("session_state", onState); s.close(); };
    }, []);

    useEffect(() => {
        const s = sockRef.current;
        if (!s || !sid) return;
        const join = () => s.emit("join_session", { sessionId: sid, role: "host" });
        join();
        s.on("connect",   join);
        s.on("reconnect", join);
        return () => { s.off("connect", join); s.off("reconnect", join); };
    }, [sid]);

    /* ─── tutorial flag ───────────────────────────────── */
    const [showTut, setShowTut] = useState(false);
    useEffect(() => setShowTut(!sessionStorage.getItem(TUT_KEY)), []);
    const dismissTut = () => { sessionStorage.setItem(TUT_KEY, "y"); setShowTut(false); };

    /* ─── helpers ─────────────────────────────────────── */
    const toggleCat  = c => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
    const createQuiz = async () => {
        const r  = await fetch(`${API}/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cats, n }),
        }).catch(() => null);
        if (!r) return alert("Backend unreachable.");
        const { sessionId } = await r.json();
        setSid(sessionId);
        sockRef.current.emit("join_session", { sessionId, role: "host" });
        setView("lobby");
    };
    const startQuiz  = () => sockRef.current.emit("start_quiz", { sessionId: sid });

    /* ─── render by view ──────────────────────────────── */
    if (view === "setup") {
        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="min-h-screen flex flex-col">
                    <Hero
                        img="/assets/boy_device.png"
                        title="Cultural Quiz"
                        blurb="Challenge your knowledge of global food, flags, and festivals with timed questions. Each quiz introduces you to unique cultural features from different countries."
                    />
                    <section className="flex flex-col items-center gap-6 p-6 bg-gray-50 flex-1">
                        <p className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm max-w-md text-center">
                            Select categories and question count, then click <b>Create</b>.
                            Each question gives {PER_Q_SEC}&nbsp;s.
                        </p>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {CAT_OPTIONS.map(c => (
                                <button key={c} onClick={() => toggleCat(c)}
                                        className={`p-3 border rounded capitalize text-lg ${
                                            cats.includes(c)
                                                ? "bg-purple-700 text-white"
                                                : "bg-white hover:bg-purple-100"}`}>
                                    {c}
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-3">
                            Questions:
                            <input
                                type="number" min="1" max="10" value={n}
                                onChange={e => setN(+e.target.value || 1)}
                                className="w-20 border rounded p-1 text-center"
                            />
                        </label>

                        <div className="flex gap-4">
                            <button onClick={() => history.back()} className="underline">Back</button>
                            <button onClick={createQuiz} disabled={!cats.length}
                                    className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40">
                                Create
                            </button>
                        </div>
                    </section>
                </main>
            </>
        );
    }

    if (view === "lobby") {
        const url =
            typeof window !== "undefined"
                ? `${window.location.origin}/Games/join?session=${sid}`
                : "";

        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="min-h-screen flex flex-col items-center gap-6 p-6 bg-gray-50">
                    <h2 className="text-2xl font-bold">Host&nbsp;Lobby</h2>
                    <p className="text-sm text-gray-700 max-w-sm text-center">
                        Share this QR code or link with contestants to let them join.
                        <br/><span className="font-medium">This screen is for the host only.</span>
                    </p>

                    <Suspense fallback={<div className="h-[200px]" />}>
                        {url && <QRCode value={url} size={200} />}
                    </Suspense>

                    {url && <a href={url} target="_blank" className="text-blue-600 underline break-all">{url}</a>}

                    <div className="w-full max-w-xs">
                        <h3 className="mt-4 mb-2 font-medium">Teams joined:</h3>
                        {Object.keys(teams).length
                            ? <ul>{Object.keys(teams).map(t => (
                                <li key={t} className="bg-white p-2 mb-1 rounded">{t}</li>
                            ))}</ul>
                            : <p className="text-gray-500 text-sm">None yet</p>}
                    </div>

                    <button onClick={startQuiz} disabled={!Object.keys(teams).length}
                            className="bg-purple-700 text-white px-6 py-2 rounded disabled:opacity-40">
                        Start Quiz
                    </button>
                </main>
            </>
        );
    }

    if (view === "play") {
        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gray-50">
                    <h2 className="text-2xl font-bold mb-4">Question {idx + 1}/{qs.length}</h2>
                    <p className="text-lg text-gray-700">Waiting for contestants to finish…</p>
                </main>
            </>
        );
    }

    if (view === "end") {
        return (
            <>
                {showTut && <TutorialOverlay dismiss={dismissTut} />}
                <main className="min-h-screen p-6 bg-gray-50 flex flex-col items-center gap-6">
                    <h2 className="text-3xl font-bold">Results</h2>
                    <table className="min-w-[260px] bg-white rounded shadow">
                        <tbody>
                        {Object.entries(teams).sort((a,b)=>b[1]-a[1]).map(([t,sc])=>(
                            <tr key={t} className="border-b last:border-0">
                                <td className="p-3 font-medium">{t}</td>
                                <td className="p-3 text-right">{sc}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {qs.length > 0 && (
                                   <details className="w-full max-w-xl mt-4">
                                         <summary className="cursor-pointer font-medium">
                                           Show correct answers
                                         </summary>
                                         <ul className="space-y-4 bg-white p-4 mt-2 rounded shadow">
                                           {qs.map((q, i) => (
                                             <li key={i}>
                                                   <p className="font-semibold">{i + 1}. {q.question}</p>
                                                   <p className="text-sm text-green-700">
                                                     [Correct] {q.options[q.answer]}
                                                   </p>
                                                 </li>
                                           ))}
                                         </ul>
                                       </details>
                                 )}
                </main>
            </>
        );
    }

    return null;
}

/* ─────────────────────────────────────────────────────────────── */
/* helpers local to this file (no separate component files needed) */
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
