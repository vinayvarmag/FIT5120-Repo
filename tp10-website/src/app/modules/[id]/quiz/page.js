/* File: src/app/modules/[id]/quiz/page.js */
"use client";

/* ───────── libraries ───────── */
import { useMemo, useState, useEffect } from "react";
import { notFound, useRouter }         from "next/navigation";
import useSWR                           from "swr";
import dynamic                          from "next/dynamic";
import { motion, AnimatePresence }      from "framer-motion";
import { modulesById }                  from "@/lib/learningModules";

/* lazy-load confetti only on client → avoids SSR warnings */
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

const fetcher = url => fetch(url).then(r => r.json());

/* ───────── helpers ───────── */
const shuffle = arr =>
    arr
        .map(v => [Math.random(), v])
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => v);

/* -------- question templates per module -------- */
const templates = {
    "global-icons": [
        {
            type: "where",
            prompt: r => `Which country is **${r.name}** from?`,
            answer: r => r.country,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.country !== r.country)).map(x => x.country)
        },
        {
            type: "what",
            prompt: r => `What is **${r.name}**’s occupation?`,
            answer: r => r.occupation,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.occupation !== r.occupation)).map(x => x.occupation)
        },
        {
            type: "who",
            prompt: r => `Who is a famous **${r.occupation}** from **${r.country}**?`,
            answer: r => r.name,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.name !== r.name && x.occupation === r.occupation)).map(x => x.name)
        }
    ],

    "traditional-arts": [
        {
            type: "where",
            prompt: r => `Which country is the craft **${r.craft}** traditional to?`,
            answer: r => r.country,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.country !== r.country)).map(x => x.country)
        },
        {
            type: "what",
            prompt: r => `What is a traditional craft of **${r.country}**?`,
            answer: r => r.craft,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.craft !== r.craft)).map(x => x.craft)
        }
    ],

    "cultural-festivals": [
        {
            type: "where",
            prompt: r => `Where is the **${r.festival}** festival celebrated?`,
            answer: r => r.country,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.country !== r.country)).map(x => x.country)
        },
        {
            type: "what",
            prompt: r => `What is a famous festival celebrated in **${r.country}**?`,
            answer: r => r.festival,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.festival !== r.festival)).map(x => x.festival)
        }
    ],

    "world-dishes": [
        {
            type: "where",
            prompt: r => `Which country does **${r.englishName}** come from?`,
            answer: r => r.country,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.country !== r.country)).map(x => x.country)
        },
        {
            type: "what",
            prompt: r => `What is a signature dish of **${r.country}**?`,
            answer: r => r.englishName,
            wrong:  (rows, r) => shuffle(rows.filter(x => x.englishName !== r.englishName)).map(x => x.englishName)
        }
    ]
};

/* -------- build a quiz (who / what / where mixed) -------- */
function buildQuiz(rows, module, n = 10) {
    const qs = [];
    const usedPrompts = new Set();

    while (qs.length < n) {
        const tmpl  = shuffle(templates[module.id])[0];  // random template
        const row   = rows[Math.floor(Math.random() * rows.length)];
        const prompt = tmpl.prompt(row);

        if (!prompt || usedPrompts.has(prompt)) continue;
        usedPrompts.add(prompt);

        const wrongOpts = tmpl.wrong(rows, row).slice(0, 3);
        if (wrongOpts.length < 3) continue;              // skip if not enough wrong choices

        qs.push({
            prompt,
            answer: tmpl.answer(row),
            options: shuffle([tmpl.answer(row), ...wrongOpts])
        });
    }
    return qs;
}

/* ───────── UI components ───────── */
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

export default function QuizPage({ params }) {
    const router = useRouter();
    const module = modulesById[params.id];
    if (!module) return notFound();

    const { data: rows, isLoading, error } = useSWR(
        () => `/data/${module.datasetKey}.json`,
        fetcher
    );

    /* game state */
    const [idx, setIdx]      = useState(0);
    const [selected, setSel] = useState(null);
    const [score, setScore]  = useState(0);
    const [finished, setEnd] = useState(false);

    const quiz = useMemo(
        () => (rows ? buildQuiz(rows, module, 10) : []),
        [rows, module]
    );
    const q = quiz[idx];

    /* handlers */
    const choose = opt => {
        if (selected) return;
        setSel(opt);
        if (opt === q.answer) setScore(s => s + 1);
    };

    const next = () => {
        if (idx + 1 < quiz.length) { setIdx(i => i + 1); setSel(null); }
        else                       setEnd(true);
    };

    const restart = () => { setIdx(0); setSel(null); setScore(0); setEnd(false); };

    /* confetti dims */
    const [dims, setDims] = useState([0, 0]);
    useEffect(() => {
        setDims([window.innerWidth, window.innerHeight]);
    }, []);

    /* ───────── render ───────── */
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
            {finished && <Confetti width={dims[0]} height={dims[1]} recycle={false} />}

            <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
                <h1 className="text-3xl font-extrabold text-orange-700">
                    {module.title} <span className="font-light">Quiz</span>
                </h1>

                {/* progress */}
                {rows && !finished && (
                    <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(idx / quiz.length) * 100}%` }}
                            transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                    </div>
                )}

                {isLoading && <p className="text-center text-gray-600">Loading questions…</p>}
                {error && <p className="text-red-600">Failed to load dataset.</p>}

                {/* quiz */}
                {rows && !finished && (
                    <AnimatePresence mode="wait">
                        <Card key={idx} className="p-8">
                            <p className="mb-6 text-lg font-medium text-gray-800">
                                <span dangerouslySetInnerHTML={{ __html: `${idx + 1}. ${q.prompt}` }} />
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
                {rows && finished && (
                    <Card className="p-10 text-center space-y-6">
                        <h2 className="text-3xl font-bold text-orange-700">
                            {score} / {quiz.length}
                        </h2>
                        <p className="text-gray-700">Great job!</p>

                        <button
                            onClick={restart}
                            className="w-full rounded-full bg-orange-600 py-3 text-white shadow hover:bg-orange-700"
                        >
                            Try again
                        </button>
                        <button
                            onClick={() => router.push(`/modules/${module.id}`)}
                            className="w-full rounded-full border border-orange-600 py-3 text-orange-700 hover:bg-orange-50"
                        >
                            Back to module
                        </button>
                    </Card>
                )}

                {!finished && rows && (
                    <p className="text-center text-sm text-gray-600">
                        Score&nbsp;{score} / {quiz.length}
                    </p>
                )}
            </main>
        </div>
    );
}
