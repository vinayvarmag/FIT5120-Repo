"use client";
import { modulesById } from "@/lib/learningModules";
import useMarkComplete from "../_useMarkComplete";

export default function Objectives({ params }) {
    const currentModule = modulesById[params.id];
    useMarkComplete(params.id, "objectives");

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black">Objectives</h2>
            <ul className="list-disc space-y-1 pl-5 text-black">
                {currentModule.objectives.map((o) => (
                    <li key={o}>{o}</li>
                ))}
            </ul>
        </section>
    );
}
