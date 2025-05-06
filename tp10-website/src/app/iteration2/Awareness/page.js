import Link from "next/link";

export default function AwarenessLanding() {
    return (
        <main className="min-h-screen pt-20 flex items-center justify-center">
            <div className="space-y-6 text-center">
                <h1 className="text-4xl font-bold text-purple-700">Culture Awareness</h1>
                <p>Select a topic below:</p>
                <div className="flex flex-col gap-3">
                    <Link href="/Awareness/precinct"  className="text-indigo-600 underline">Cultural Precinct Exploration</Link>
                    <Link href="/Awareness/modules"   className="text-indigo-600 underline">Learning Modules</Link>
                    <Link href="/Awareness/etiquette" className="text-indigo-600 underline">Cultural Etiquette Guide</Link>
                </div>
            </div>
        </main>
    );
}
