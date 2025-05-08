/* File: src/app/modules/[id]/quiz/page.js */
"use client";

/* ─── libraries ─── */
import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import useSWR                           from "swr";
import dynamic                          from "next/dynamic";
import { motion, AnimatePresence }      from "framer-motion";
import { modulesById }                  from "@/lib/learningModules";

/* lazy‑load confetti only on client */
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

/* helpers */
const fetcher = url => fetch(url).then(r => r.json());
const shuffle = arr =>
    arr
        .map(v => [Math.random(), v])
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v);

/* ─── question templates ──────────────────────────────
 *  Each item is  { prompt : "<string with {placeholders}>",
 *                  answerKey : "<field in the row that is correct>" }
 *  The placeholders may reference any field EXCEPT answerKey,
 *  so the prompt never reveals the answer.
 */
const templates = {
    arts: [
        {
            prompt: "{craft} is a traditional craft from which country?",
            answerKey: "country"
        },
        {
            prompt: "Which country is famous for the craft of {craft}?",
            answerKey: "country"
        }
    ],

    celebrities: [
        {
            prompt: "What is {name} best known for?",
            answerKey: "occupation"
        },
        {
            prompt: "{name} comes from which country?",
            answerKey: "country"
        }
    ],

    dishes: [
        {
            prompt: "The dish {englishName} originates from which country?",
            answerKey: "country"
        },
        {
            prompt: "{englishName} is typically classified as which course or type?",
            answerKey: "type"
        }
    ]
};

/* ─── build a quiz (returns up to n Q&A objects) ─── */
function buildQuiz(rows, mod, n = 10) {
    if (!rows || !mod) return [];

    /* choose the template list that matches this module */
    const key = mod.datasetKey ?? mod.id;
    const moduleTemplates = templates[key] || [];
    if (!moduleTemplates.length) return [];           // no templates ⇒ no quiz

    const qs = [];
    const sampledRows = shuffle(rows).slice(0, n);

    sampledRows.forEach(r => {
        const { prompt: tpl, answerKey } = shuffle(moduleTemplates)[0];

        /* fill placeholders that are present in the row */
        const prompt = tpl.replace(/\{(\w+)}/g, (_, k) => r[k] ?? "—");

        /* correct answer */
        const answer = r[answerKey];
        if (!answer) return;                          // skip if missing

        /* 3 wrong options */
        const wrong = shuffle(
            rows
                .filter(o => o[answerKey] !== answer && o[answerKey])
                .map(o => o[answerKey])
        ).slice(0, 3);

        qs.push({
            prompt,
            answer,
            options: shuffle([answer, ...wrong])
        });
    });

    return qs;
}

/* ─── lightweight animated card ─── */
const Card = ({ children, className = "" }) => (
    <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className={`rounded-3xl bg-white/70 backdrop-blur-lg shadow-xl ${className}`}
    >
        {children}
    </motion.div>
);

export default function QuizPage() {
    /* ── routing / data ── */
    const params         = useParams();
    const router         = useRouter();
    const id             = params.id;
    const currentModule  = modulesById[id];

    const { data: rows, isLoading, error } = useSWR(
        currentModule ? `/data/${currentModule.datasetKey}.json` : null,
        fetcher
    );

    /* ── quiz state ── */
    const [idx,      setIdx] = useState(0);
    const [selected, setSel] = useState(null);
    const [score,    setScr] = useState(0);
    const [finished, setEnd] = useState(false);

    const quiz      = useMemo(() => buildQuiz(rows, currentModule, 10), [rows, currentModule]);
    const quizReady = quiz.length > 0;
    const q         = quizReady ? quiz[idx] : null;

    /* confetti size */
    const [dims, setDims] = useState([0, 0]);
    useEffect(() => {
        setDims([window.innerWidth, window.innerHeight]);
    }, []);

    /* ── handlers ─ */
    const choose = opt => {
        if (!quizReady || selected) return;
        setSel(opt);
        if (opt === q.answer) setScr(s => s + 1);
    };
    const next = () => {
        if (!quizReady) return;
        if (idx + 1 < quiz.length) { setIdx(i => i + 1); setSel(null); }
        else                       setEnd(true);
    };
    const restart = () => { setIdx(0); setSel(null); setScr(0); setEnd(false); };

    if (!currentModule) return notFound();

    /* ── UI ───────────────────────────────────────────── */
    return (
        <div className="w-full ">
            {finished && <Confetti width={dims[0]} height={dims[1]} recycle={false} />}

            <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
                <h1 className="text-3xl font-extrabold text-purple-600">
                    {currentModule.title} <span className="font-light">Quiz</span>
                </h1>

                {/* progress bar */}
                {quizReady && !finished && (
                    <div className="h-3 w-full overflow-hidden rounded-full bg-purple-100">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(idx / quiz.length) * 100}%` }}
                            transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                    </div>
                )}

                {isLoading && <p className="text-center text-black">Loading questions…</p>}
                {error      && <p className="text-red-600">Failed to load dataset.</p>}

                {/* main quiz panel */}
                {quizReady && !finished && (
                    <AnimatePresence mode="wait">
                        <Card key={idx} className="p-8">
                            <p className="mb-6 text-lg font-medium text-black">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: `${idx + 1}. ${q.prompt}`
                                    }}
                                />
                            </p>

                            <ul className="space-y-4">
                                {q.options.map(opt => {
                                    const base    = "w-full rounded-xl px-4 py-3 text-left transition";
                                    const idle    = "bg-white/80 hover:bg-orange-50 border border-gray-300";
                                    const correct = "bg-green-100 border-green-600";
                                    const wrong   = "bg-red-100 border-red-600";

                                    const style =
                                        !selected
                                            ? idle
                                            : opt === q.answer
                                                ? correct
                                                : selected === opt
                                                    ? wrong
                                                    : "bg-white/60";

                                    return (
                                        <li key={opt}>
                                            <button
                                                disabled={!!selected}
                                                onClick={() => choose(opt)}
                                                className={`${base} ${style}`}
                                            >
                                                {opt}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {selected && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={next}
                                    className="mt-8 w-full rounded-full bg-orange-600 py-3 text-white shadow hover:bg-orange-700"
                                >
                                    {idx + 1 < quiz.length ? "Next question" : "Show result"}
                                </motion.button>
                            )}
                        </Card>
                    </AnimatePresence>
                )}

                {/* final score */}
                {quizReady && finished && (
                    <Card className="p-10 text-center space-y-6">
                        <h2 className="text-3xl font-bold text-orange-700">
                            {score} / {quiz.length}
                        </h2>
                        <p className="text-black">Great job!</p>

                        <button
                            onClick={restart}
                            className="w-full rounded-full bg-orange-600 py-3 text-white shadow hover:bg-orange-700"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => router.push(`/modules/${currentModule.id}`)}
                            className="w-full rounded-full border border-orange-600 py-3 text-orange-700 hover:bg-orange-50"
                        >
                            Back to module
                        </button>
                    </Card>
                )}

                {/* live score footer */}
                {quizReady && !finished && (
                    <p className="text-center text-sm text-black">
                        Score&nbsp;{score} / {quiz.length}
                    </p>
                )}
            </main>
        </div>
    );
}
