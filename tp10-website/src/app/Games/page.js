"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import io from "socket.io-client";
const QRCode = lazy(() => import("react-qr-code"));

const API = process.env.NEXT_PUBLIC_API_URL;
const PER_Q_SEC = 10;

const CAT_OPTIONS = [
    "flags", "food", "fest", "music", "landmarks", "clothing", "language", "sports",
];

const TUT_KEY = "tutSeen-v2";

export default function Games() {
    const sockRef = useRef(null);
    useEffect(() => {
        sockRef.current = io(API);
        const onState = (d) => {
            setTeams(d.teams);
            setStat(d.status);
            setQs(d.questions);
            setIdx(d.idx);
            setDeadline(d.deadline);
            if (d.status === "running") setView("host-play");
            if (d.status === "ended") setView("host-end");
        };
        const s = sockRef.current;
        s.on("session_state", onState);
        s.on("error_msg", (x) => alert(x.msg));
        return () => {
            s.off("session_state", onState);
            s.close();
        };
    }, []);

    const [view, setView] = useState("menu");
    const [cats, setCats] = useState([]);
    const [n, setN] = useState(4);
    const [sid, setSid] = useState("");
    const [teams, setTeams] = useState({});
    const [status, setStat] = useState("lobby");
    const [qs, setQs] = useState([]);
    const [idx, setIdx] = useState(0);
    const [deadline, setDeadline] = useState(null);
    const [word, setWord] = useState("sushi");
    const [recording, setRec] = useState(false);
    const [result, setRes] = useState(null);
    const [audioUrl, setAudio] = useState(null);
    const [ttsUrl, setTts] = useState(null);
    const [showTut, setShowTut] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(TUT_KEY);
        setShowTut(!seen);
    }, []);

    const dismissTut = () => {
        localStorage.setItem(TUT_KEY, "y");
        setShowTut(false);
    };

    const toggleCat = (c) =>
        setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

    const createQuiz = async () => {
        const res = await fetch(API + "/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cats, n }),
        }).catch(() => null);
        if (!res) return alert("Backend unreachable.");
        const d = await res.json();
        setSid(d.sessionId);
        sockRef.current.emit("join_session", { sessionId: d.sessionId, role: "host" });
        setView("lobby");
    };

    const startQuiz = () => sockRef.current.emit("start_quiz", { sessionId: sid });

    const record = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
        const chunks = [];
        mr.ondataavailable = (e) => chunks.push(e.data);
        mr.onstop = async () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const local = URL.createObjectURL(blob);
            setAudio(local);
            const fd = new FormData();
            fd.append("word", word);
            fd.append("wav", blob, "audio.webm");
            const resp = await fetch(API + "/pronounce", { method: "POST", body: fd });
            const d = await resp.json();
            setRes(d);
            setTts(API + d.tts);
            setRec(false);
            setView("pronounce-result");
        };
        mr.start();
        setRec(true);
        setTimeout(() => mr.stop(), 2000);
    };

    const beginCountdown = () => {
        let c = 3;
        setCountdown(c);
        const t = setInterval(() => {
            c -= 1;
            if (c === 0) {
                clearInterval(t);
                setCountdown("Speak!");
                record();
                setTimeout(() => setCountdown(null), 400);
            } else setCountdown(c);
        }, 1000);
    };

    const [countdown, setCountdown] = useState(null);

    const Tut = showTut ? <TutorialOverlay dismiss={dismissTut} /> : null;

    if (view === "menu") {
        return (
            <>
                {Tut}
                <main className="min-h-screen bg-gray-50 grid place-items-center p-6">
                    <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                        <Card img="/Games.png" title="Cultural Quiz" onClick={() => setView("quiz-setup")} />
                        <Card img="/Awareness.png" title="Pronunciation" onClick={() => setView("pronounce-setup")} />
                    </div>
                </main>
            </>
        );
    }

    if (view === "quiz-setup") {
        return (
            <>
                {Tut}
                <main className="min-h-screen flex flex-col items-center gap-6 p-6 bg-gray-50">
                    <h2 className="text-2xl font-bold">Create Quiz</h2>
                    <p className="bg-yellow-50 border border-yellow-300 p-3 rounded text-sm max-w-md text-center">
                        Select one or more categories, choose the number of questions, then click <b>Create</b> to open a lobby for participants to join.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {CAT_OPTIONS.map((c) => (
                            <button key={c} onClick={() => toggleCat(c)}
                                className={"p-3 border rounded capitalize " + (cats.includes(c) ? "bg-purple-700 text-white" : "")}>
                                {c}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-3">
                        Questions:
                        <input
                            type="number" min="1" max="10"
                            value={n}
                            onChange={(e) => setN(+e.target.value || 1)}
                            className="w-20 border rounded p-1"
                        />
                    </label>
                    <div className="flex gap-4">
                        <button onClick={() => setView("menu")} className="underline">Back</button>
                        <button
                            onClick={createQuiz}
                            disabled={cats.length === 0}
                            className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40">
                            Create
                        </button>
                    </div>
                </main>
            </>
        );
    }

    if (view === "lobby") {
        const url = typeof window !== "undefined"
            ? window.location.origin + "/Games/join?session=" + sid
            : "";
        return (
            <>
                {Tut}
                <main className="min-h-screen flex flex-col items-center gap-6 p-6 bg-gray-50">
                    <h2 className="text-xl font-semibold">Scan or open link</h2>
                    <p className="text-sm text-gray-700 max-w-xs text-center">
                        Participants can join your game using this QR code or the link below.
                    </p>
                    <Suspense fallback={<div className="h-[200px]" />}>
                        {url && <QRCode value={url} size={200} />}
                    </Suspense>
                    {url && (
                        <a href={url} target="_blank" className="text-blue-600 underline break-all">
                            {url}
                        </a>
                    )}
                    <div className="w-full max-w-xs">
                        <h3 className="mt-4 mb-2 font-medium">Teams:</h3>
                        {Object.keys(teams).length ? (
                            <ul>
                                {Object.keys(teams).map((t) => (
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
                        className="bg-purple-700 text-white px-6 py-2 rounded disabled:opacity-40">
                        Start Quiz
                    </button>
                </main>
            </>
        );
    }

    if (view === "host-play") {
        return (
            <>
                {Tut}
                <main className="min-h-screen p-6 flex flex-col items-center bg-gray-50">
                    <h2 className="text-2xl font-bold mb-4">
                        Question {idx + 1}/{qs.length}
                    </h2>
                    <p className="text-gray-700">Waiting on participants...</p>
                </main>
            </>
        );
    }

    if (view === "host-end") {
        return (
            <>
                {Tut}
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
                        <summary className="cursor-pointer mb-2 font-medium">
                            Show correct answers
                        </summary>
                        <ul className="space-y-4 bg-white p-4 rounded shadow">
                            {qs.map((q, i) => (
                                <li key={i}>
                                    <p className="font-semibold">{q.question}</p>
                                    <p className="text-sm text-green-700">
                                        [Correct] {q.options[q.answer]}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </details>
                </main>
            </>
        );
    }

    if (view === "pronounce-setup") {
        return (
            <>
                {Tut}
                <main className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto text-center">
                    <h2 className="text-2xl font-bold">Pronunciation Challenge</h2>
                    <input
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Type a word (e.g. samosa)"
                    />
                    {countdown !== null && (
                        <p className="text-3xl font-bold">{countdown}</p>
                    )}
                    <div className="flex gap-4">
                        <button onClick={() => setView("menu")}>Back</button>
                        <button
                            onClick={beginCountdown}
                            disabled={recording || word.trim() === ""}
                            className="bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-40">
                            {recording ? "Recording..." : "Start"}
                        </button>
                    </div>
                </main>
            </>
        );
    }

    if (view === "pronounce-result" && result) {
        return (
            <>
                {Tut}
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
                    <button
                        onClick={() => {
                            setRes(null);
                            setAudio(null);
                            setTts(null);
                            setView("pronounce-setup");
                        }}
                        className="bg-purple-700 text-white px-4 py-2 rounded mt-4">
                        Play again
                    </button>
                </main>
            </>
        );
    }

    return null;
}

function Card({ img, title, onClick }) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden">
            <img src={img} alt="" className="h-48 w-full object-cover" />
            <div className="p-6">
                <h3 className="font-bold text-xl">{title}</h3>
            </div>
        </div>
    );
}

function TutorialOverlay({ dismiss }) {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl text-left space-y-4">
                <h2 className="text-xl font-bold">How the games work</h2>
                <ol className="list-decimal pl-4 space-y-1 text-sm">
                    <li>
                        <b>Pronunciation Game:</b> press <kbd>Start</kbd>, speak when prompted, then compare your clip with the reference.
                    </li>
                    <li>
                        <b>Quiz:</b> each question allows <b>{PER_Q_SEC} s</b>. Watch the purple bar on your device!
                    </li>
                    <li>
                        <b>Scores:</b> instant feedback after every action; totals at the end.
                    </li>
                </ol>
                <button
                    onClick={dismiss}
                    className="mt-2 bg-purple-700 text-white px-4 py-2 rounded w-full">
                    Got it - let's play!
                </button>
            </div>
        </div>
    );
}
