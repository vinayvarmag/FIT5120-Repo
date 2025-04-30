"use client";
import { modulesById } from "@/lib/learningModules";
import useMarkComplete from "../_useMarkComplete";

export default function Overview({ params }) {
    const currentModule = modulesById[params.id];
    useMarkComplete(params.id, "overview");

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black">Overview</h2>
            <p className="text-gray-800">{currentModule.overview}</p>
        </section>
    );
}
