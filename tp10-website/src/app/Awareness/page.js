import Link from "next/link";
import { FaMapMarkedAlt, FaBookOpen, FaUsers } from "react-icons/fa";

export default function AwarenessLanding() {
    const topics = [
        {
            key: "precinct",
            title: "Cultural Precinct Exploration",
            icon: FaMapMarkedAlt,
            description: "Explore local cultural precincts through interactive maps and historical insights.",
        },
        {
            key: "modules",
            title: "Learning Modules",
            icon: FaBookOpen,
            description: "Engage with structured learning modules covering global traditions, languages, and customs.",
        },
        {
            key: "etiquette",
            title: "Cultural Etiquette Guide",
            icon: FaUsers,
            description: "Discover essential etiquette tips for respectful interactions across different cultures.",
        },
    ];

    return (
        <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4">
            <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
                Culture Awareness
            </h1>

            <div className="flex flex-col gap-6 w-full max-w-4xl">
                {topics.map(({ key, title, icon: Icon, description }) => (
                    <Link
                        key={key}
                        href={`/Awareness/${key}`}
                        className="flex items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                    >
                        {/* Left: Icon & Title */}
                        <div className="flex-none w-64 flex items-center space-x-4 mr-8">
                            <Icon className="text-4xl text-purple-600" />
                            <h3 className="text-xl font-semibold text-black dark:text-black">
                                {title}
                            </h3>
                        </div>

                        {/* Right: Description */}
                        <div className="flex-1">
                            <p className="text-black dark:text-black">
                                {description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
