/* File: src/app/Games/page.js */
"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import io from "socket.io-client";
const QRCode = lazy(() => import("react-qr-code"));

export const dynamic = "force-dynamic";     // <-- skip static optimisation

const API = process.env.NEXT_PUBLIC_API_URL;

/* ---------------------------- component ---------------------------- */

export default function Games() {
    /* -- socket hookup ------------------------------------------------ */
    const sockRef = useRef(null);
    useEffect(() => {
        const s = io(API, { transports: ["websocket"] });
        sockRef.current = s;

        const onState = d => {
            console.log("Received session state:", d);
            setTeams(d.teams);
            setStat(d.status);
            setQs(d.questions);
            setIdx(d.idx);
            setDeadline(d.deadline);
            if (d.status === "running") setView("host-play");
            if (d.status === "ended")   setView("host-end");
        };

        s.on("session_state", onState);
        s.on("error_msg", x => alert(x.msg));

        return () => {
            s.off("session_state", onState);
            s.close();
        };
    }, []);

    /* -- state --------------------------------------------------------- */
    const [view, setView]         = useState("menu");
    const [count, setCount]       = useState(null);

    const [cats, setCats]         = useState([]);
    const [n, setN]               = useState(4);
    const [sid, setSid]           = useState("");
    const [teams, setTeams]       = useState({});
    const [status, setStat]       = useState("lobby");
    const [qs, setQs]             = useState([]);
    const [idx, setIdx]           = useState(0);
    const [deadline, setDeadline] = useState(null);

    const [word, setWord]         = useState("sushi");
    const [recording, setRec]     = useState(false);
    const [result, setRes]        = useState(null);

    /* -- helpers ------------------------------------------------------- */
    const toggleCat = c =>
        setCats(p => (p.includes(c) ? p.filter(x => x !== c) : [...p, c]));

    const createQuiz = async () => {
        try {
            const res = await fetch(API + "/quiz", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ cats, n })
            });
            const d = await res.json();
            setSid(d.sessionId);
            sockRef.current.emit("join_session", { sessionId: d.sessionId, role: "host" });
            setView("lobby");
        } catch (e) {
            console.error(e);
            alert("Failed to reach backend.");
        }
    };

    const startQuiz = () =>
        sockRef.current.emit("start_quiz", { sessionId: sid });

    /* -- pronunciation helpers ---------------------------------------- */
    const record = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr     = new MediaRecorder(stream, { mimeType: "audio/webm" });
        const chunks = [];
        mr.ondataavailable = e => chunks.push(e.data);
        mr.onstop = async () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const fd   = new FormData();
            fd.append("word", word);
            fd.append("wav", blob, "audio.webm");
            const r = await fetch(API + "/pronounce", { method: "POST", body: fd });
            setRes(await r.json());
            setRec(false);
            setView("pronounce-result");
        };
        mr.start();
        setRec(true);
        setTimeout(() => mr.stop(), 2000);
    };

    const beginCountdown = () => {
        let c = 3;
        setCount(c);
        const t = setInterval(() => {
            c -= 1;
            if (c === 0) {
                clearInterval(t);
                setCount("Speak!");
                record();
                setTimeout(() => setCount(null), 400);
            } else setCount(c);
        }, 1000);
    };

    /* -- derived values ----------------------------------------------- */
    const secsLeft = deadline
        ? Math.max(0, Math.round(deadline - Date.now() / 1000))
        : 0;

    /* -- views --------------------------------------------------------- */
    if (view === "menu") {
        return (
            <main className="min-h-screen bg-gray-50 grid place-items-center p-6">
                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div
                        onClick={() => setView("quiz-setup")}
                        className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden"
                    >
                        <img src="/Games.png" alt="" className="h-48 w-full object-cover" />
                        <div className="p-6">
                            <h3 className="font-bold text-xl">Cultural Quiz</h3>
                        </div>
                    </div>
                    <div
                        onClick={() => setView("pronounce-setup")}
                        className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden"
                    >
                        <img src="/Awareness.png" alt="" className="h-48 w-full object-cover" />
                        <div className="p-6">
                            <h3 className="font-bold text-xl">Pronunciation</h3>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (view === "quiz-setup") {
        return (
            <main className="min-h-screen flex flex-col items-center gap-6 p-6 bg-gray-50">
                <h2 className="text-2xl font-bold">Create Quiz</h2>

                <div className="grid grid-cols-3 gap-4">
                    {["flags", "food", "fest"].map(c => (
                        <button
                            key={c}
                            onClick={() => toggleCat(c)}
                            className={`p-3 border rounded ${cats.includes(c) ? "bg-purple-700 text-white" : ""}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <label className="flex items-center gap-3">
                    Questions:
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={n}
                        onChange={e => setN(+e.target.value || 1)}
                        className="w-20 border rounded p-1"
                    />
                </label>

                <div className="flex gap-4">
                    <button onClick={() => setView("menu")} className="underline">Back</button>
                    <button
                        onClick={createQuiz}
                        disabled={cats.length === 0}
                        className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40"
                    >
                        Create
                    </button>
                </div>
            </main>
        );
    }

    if (view === "lobby") {
        /* location is only available in the browser; during SSR it is undefined,
           but dynamic = "force-dynamic" means this code never runs on the server */
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url    = `${origin}/Games/join?session=${sid}`;

        return (
            <main className="min-h-screen flex flex-col items-center gap-6 p-6 bg-gray-50">
                <h2 className="text-xl font-semibold">Scan or open link</h2>

                <Suspense fallback={<div className="h-[200px]" />}>
                    {origin && <QRCode value={url} size={200} />}
                </Suspense>

                {origin && (
                    <a href={url} target="_blank" className="text-blue-600 underline break-all">
                        {url}
                    </a>
                )}

                <div className="w-full max-w-xs">
                    <h3 className="mt-4 mb-2 font-medium">Teams:</h3>
                    {Object.keys(teams).length ? (
                        <ul>
                            {Object.keys(teams).map(t => (
                                <li key={t} className="bg-white p-2 mb-1 rounded">{t}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">None yet</p>
                    )}
                </div>

                <button
                    onClick={startQuiz}
                    disabled={!Object.keys(teams).length}
                    className="bg-purple-700 text-white px-6 py-2 rounded disabled:opacity-40"
                >
                    Start Quiz
                </button>
            </main>
        );
    }

    if (view === "host-play") {
        return (
            <main className="min-h-screen p-6 flex flex-col items-center bg-gray-50">
                <h2 className="text-2xl font-bold mb-4">
                    Question {idx + 1}/{qs.length}
                </h2>

                <p className="mb-6 text-gray-700">Waiting on participants...</p>

                <div className="w-full max-w-sm h-3 bg-gray-200 rounded">
                    <div
                        className="h-full bg-purple-700 rounded"
                        style={{ width: `${(secsLeft / 10) * 100}%`, transition: "width 1s linear" }}
                    />
                </div>
                <p className="mt-2 text-sm text-gray-500">{secsLeft}s left</p>
            </main>
        );
    }

    if (view === "host-end") {
        return (
            <main className="min-h-screen p-6 bg-gray-50 flex flex-col items-center gap-6">
                <h2 className="text-3xl font-bold">Results</h2>

                <table className="min-w-[260px] bg-white rounded shadow">
                    <tbody>
                        {Object.entries(teams)
                            .sort((a, b) => b[1] - a[1])
                            .map(([t, sc]) => (
                                <tr key={t} className="border-b last:border-0">
                                    <td className="p-3 font-medium">{t}</td>
                                    <td className="p-3 text-right">{sc}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                <details className="w-full max-w-xl">
                    <summary className="cursor-pointer mb-2 font-medium">Show correct answers</summary>
                    <ul className="space-y-4 bg-white p-4 rounded shadow">
                        {qs.map((q, i) => (
                            <li key={i}>
                                <p className="font-semibold">{q.question}</p>
                                <p className="text-sm text-green-700">[Correct] {q.options[q.answer]}</p>
                            </li>
                        ))}
                    </ul>
                </details>
            </main>
        );
    }

    if (view === "pronounce-setup") {
        return (
            <main className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto text-center">
                <h2 className="text-2xl font-bold">Pronunciation Challenge</h2>

                <input
                    value={word}
                    onChange={e => setWord(e.target.value)}
                    className="w-full border rounded p-2"
                    placeholder="Type a word (e.g. samosa)"
                />

                {count !== null && <p className="text-3xl font-bold">{count}</p>}

                <div className="flex gap-4">
                    <button onClick={() => setView("menu")}>Back</button>
                    <button
                        onClick={beginCountdown}
                        disabled={recording || word.trim() === ""}
                        className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40"
                    >
                        {recording ? "Recording..." : "Start"}
                    </button>
                </div>
            </main>
        );
    }

    if (view === "pronounce-result" && result) {
        return (
            <main className="flex flex-col items-center gap-6 p-6 text-center">
                <h2 className="text-2xl font-bold">Result</h2>

                <p>You said: <code>{result.transcript}</code></p>
                <p>Accuracy: <b>{result.score}</b></p>

                <p className={result.pass ? "text-green-600" : "text-red-600"}>
                    {result.pass ? "Great job!" : "Try again!"}
                </p>

                <button
                    onClick={() => {
                        setRes(null);
                        setView("pronounce-setup");
                    }}
                    className="bg-purple-700 text-white px-4 py-2 rounded"
                >
                    Play again
                </button>
            </main>
        );
    }

    return null;    // fallback (shouldn't hit)
}
