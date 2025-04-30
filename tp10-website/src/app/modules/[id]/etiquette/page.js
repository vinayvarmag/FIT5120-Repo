"use client";
import { modulesById } from "@/lib/learningModules";
import useMarkComplete from "../_useMarkComplete";

export default function Etiquette({ params }) {
    const currentModule = modulesById[params.id];
    useMarkComplete(params.id, "etiquette");

    return (
        <section className="space-y-4">
            <h2 className="text-xl font-semibold text-black">Etiquette essentials</h2>
            <div className="overflow-x-auto rounded border border-black text-black ">
                <table className="w-full divide-y divide-gray-200 text-sm">
                    <tbody>
                    {currentModule.etiquette.map(([topic, rule]) => (
                        <tr key={topic} className="divide-x text-center text-black divide-black">
                            <th className="w-40  text-black text-center text-blackpx-4 py-3 font-medium">
                                {topic}
                            </th>
                            <td className="px-4 py-3 text-black text-center">{rule}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
