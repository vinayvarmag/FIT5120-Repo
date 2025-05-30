/* File: src/app/Games/join/page.js */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function JoinClient() {
    const search = useSearchParams();
    const initialSid = search.get("session") || "";

    /* ---------- local state ---------- */
    const [sid, setSid] = useState(initialSid);
    const [team, setTeam] = useState("");
    const [joined, setJoined] = useState(false);

    const [status, setStatus] = useState("lobby");
    const [qs, setQs] = useState([]);
    const [idx, setIdx] = useState(0);
    const [deadline, setDeadline] = useState(null);
    const [questionTotal, setQTotal] = useState(20);   // per-question max
    const [choice, setChoice] = useState(null);
    const [score, setScore] = useState(0);
    const [feedback, setFB] = useState(null);

    /* keep ticking so our countdown is reactive */
    const [now, setNow] = useState(() => Date.now() / 1000);
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now() / 1000), 1000);
        return () => clearInterval(id);
    }, []);

    /* ---------- socket setup ---------- */
    const sockRef = useRef(null);
    useEffect(() => {
        sockRef.current = io(API, {
            secure: true,
            transports: ["websocket"],
            path: "/socket.io",
        });
        const s = sockRef.current;

        s.on("session_state", d => {
            setStatus(d.status);
            setQs(d.questions);
            setIdx(d.idx);
            setDeadline(d.deadline);

            /* compute total seconds for this question */
            if (d.deadline) {
                const secs = Math.max(
                    1,
                    Math.ceil(d.deadline - Date.now() / 1000)
                );
                setQTotal(secs);
            }

            setFB(null);
            setChoice(null);
        });

        s.on("answer_result", d => {
            setFB(d.correct);
            setScore(d.score);
        });

        s.on("error_msg", e => alert(e.msg));
        return () => s.close();
    }, []);

    /* ---------- actions ---------- */
    const join = () => {
        sockRef.current.emit("join_session", {
            sessionId: sid.trim(),
            role: "player",
            teamName: team.trim(),
        });
        setJoined(true);
    };

    const submit = () => {
        if (choice == null) return;
        sockRef.current.emit("answer", {
            sessionId: sid.trim(),
            choice,
        });
    };

    /* ---------- derived ---------- */
    const secsLeft = deadline ? Math.max(0, Math.ceil(deadline - now)) : 0;
    const q = qs[idx] ?? { question: "", options: [] };
    const progressPct =
        questionTotal > 0 ? (secsLeft / questionTotal) * 100 : 0;

    /* =================== VIEWS =================== */
    if (!joined) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
                <h1 className="text-3xl font-bold">Join&nbsp;Quiz</h1>

                {!initialSid && (
                    <input
                        placeholder="Session ID"
                        value={sid}
                        onChange={e => setSid(e.target.value)}
                        className="border rounded px-3 py-2 w-64"
                    />
                )}

                <input
                    placeholder="Team Name"
                    value={team}
                    onChange={e => setTeam(e.target.value)}
                    className="border rounded px-3 py-2 w-64"
                />

                <button
                    onClick={join}
                    disabled={!sid.trim() || !team.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded shadow disabled:opacity-50"
                >
                    Join
                </button>
            </main>
        );
    }

    if (status === "lobby") {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
                <h2 className="text-2xl font-bold">Waiting for host to start...</h2>
            </main>
        );
    }

    if (status === "ended") {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
                <h2 className="text-3xl font-bold">Quiz Finished!</h2>
                <p className="text-xl">Your score: {score}</p>
            </main>
        );
    }

    /* ---------- ACTIVE QUESTION ---------- */
    return (
        <main className="min-h-screen p-6 flex flex-col items-center gap-6">
            <h2 className="text-xl font-semibold">
                Question {idx + 1}/{qs.length}
            </h2>

            <p className="font-semibold text-lg md:text-xl mb-2 text-center max-w-xl">
                {q.question}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-md">
                {q.options.map((opt, i) => (
                    <button
                        key={i}
                        disabled={choice != null}
                        onClick={() => setChoice(i)}
                        className={`w-full px-4 py-2 rounded-lg border text-lg md:text-xl font-normal
              ${choice === i
                                ? "bg-purple-700 text-white"
                                : "bg-white text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {choice != null && (
                <button
                    onClick={submit}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded shadow"
                >
                    Submit
                </button>
            )}

            {feedback != null && (
                <p
                    className={`mt-4 text-lg font-medium ${feedback ? "text-green-700" : "text-red-600"
                        }`}
                >
                    {feedback ? "Correct!" : "Wrong!"}
                </p>
            )}

            {/* progress bar + seconds left */}
            <div className="w-full max-w-md h-2 bg-gray-200 rounded mt-6">
                <div
                    className="h-full bg-purple-700 rounded"
                    style={{
                        width: `${progressPct}%`,
                        transition: "width 1s linear",
                    }}
                />
            </div>
            <p className="text-sm text-gray-500">{secsLeft}s&nbsp;left</p>
        </main>
    );
}
