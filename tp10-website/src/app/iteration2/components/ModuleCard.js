"use client";

import Image from "next/image";
import Link from "next/link";
import { getProgress } from "@/utils/progress";
import ProgressBar from "@/components/ProgressBar";
import { useEffect, useState } from "react";

export default function ModuleCard({ module }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => setProgress(getProgress(module.id)), [module.id]);

    const buttonLabel =
        progress === 0 ? "Start" : progress === 100 ? "Completed" : "Continue";

    return (
        <Link
            href={`/modules/${module.id}/overview`}
            className="flex flex-col overflow-hidden rounded-lg border
                 border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
            <div className="relative h-44 w-full">
                <Image src={module.img} alt={module.title} fill className="object-cover" />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <h2 className="text-sm font-semibold">{module.title}</h2>

                <ProgressBar value={progress} />
                <p className="text-xs text-gray-600">{progress}% completed</p>

                <span className="mt-auto inline-block rounded-md border border-gray-800
                         px-3 py-1.5 text-center text-sm font-medium text-gray-900
                         transition hover:bg-purple-900 hover:text-white">
          {buttonLabel}
        </span>
            </div>
        </Link>
    );
}
