"use client";
import { modulesById } from "@/lib/learningModules";
import useMarkComplete from "../_useMarkComplete";
import Link from "next/link";

export default function Resources({ params }) {
    const currentModule = modulesById[params.id];
    useMarkComplete(params.id, "resources");

    return (
        <section className="space-y-6">
            <h2 className="text-xl font-semibold text-black">Additional resources</h2>

            {currentModule.resources?.video && (
                <div className="aspect-video overflow-hidden rounded shadow">
                    <iframe
                        src={currentModule.resources.video}
                        title="Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                    />
                </div>
            )}

            {currentModule.resources?.guide && (
                <a
                    href={currentModule.resources.guide}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
                >
                    Read the guide ↗
                </a>
            )}

        </section>
    );
}
