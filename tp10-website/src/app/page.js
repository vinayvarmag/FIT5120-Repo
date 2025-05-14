'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi';
import { FaGlobe } from 'react-icons/fa';
import { CgGames } from 'react-icons/cg';

/* ─── hero images ────────────────────────────────── */
const heroSlides = ['/slide1.jpg', '/slide2.jpg', '/slide3.jpg'];

/* ─── feature cards ──────────────────────────────── */
const features = [
    {
        title: 'Games',
        description:
            'Step into a world of fun cultural games! From language match‑ups to global trivia and role‑play adventures.',
        icon: CgGames,
        link: '/Games',
    },
    {
        title: 'Event Calendar',
        description:
            'Discover local and international events happening throughout the year.',
        icon: FiCalendar,
        link: '/EventCalendar',
    },
    {
        title: 'Exchange Program',
        description:
            'Make friends across the world! Join global classrooms, exchange letters, or team up on cultural projects.',
        icon: FiMapPin,
        link: '/ExchangeProgram',
    },
    {
        title: 'Event Planner',
        description: 'Plan events across the world!',
        icon: FiUsers,
        link: '/events',
    },
    {
        title: 'Culture Awareness',
        description:
            'Uncover stories, traditions, and values from different cultures.',
        icon: FaGlobe,
        link: '/Awareness',
    },
];

/* ─── hero section ───────────────────────────────── */
function HeroSection({ onExplore }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
            5000,
        );
        return () => clearInterval(interval);
    }, []);

    return (
        <section
            className="relative w-full h-[calc(100vh-80px)] bg-center bg-cover transition-all duration-1000"
            style={{ backgroundImage: `url(${heroSlides[currentSlide]})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black to-black opacity-50 z-0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg tracking-wide">
                    UNITE BY CULTURE
                </h1>
                <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl leading-relaxed drop-shadow-md">
                    Fostering cultural understanding through interactive learning
                    experiences that bring people together across borders and traditions.
                </p>
                <button
                    onClick={onExplore}
                    className="bg-purple-900 text-white px-8 py-4 rounded-full text-lg sm:text-xl font-semibold hover:bg-purple-700 transition"
                >
                    Explore Events
                </button>

                {/* slide dots */}
                <div className="absolute bottom-8 flex space-x-3">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-4 h-4 rounded-full transition-all ${
                                currentSlide === idx
                                    ? 'bg-white'
                                    : 'bg-gray-400 bg-opacity-50'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── main page ──────────────────────────────────── */
export default function HomePage() {
    const router = useRouter();

    return (
        <main className="w-full">
            <HeroSection onExplore={() => router.push('/EventCalendar')} />

            {/* discover section */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-6">
                        Discover Cultural Activities
                    </h2>

                    {/* NEW descriptive paragraph */}
                    <p className="text-center max-w-3xl mx-auto text-gray-700 mb-3">
                        Welcome to <span className="font-semibold">Divercity</span>!
                        This interactive tool is designed for the classroom, helping teachers
                        effortlessly guide students to explore and understand cultures from
                        around the world.
                    </p>
                    <p className="text-center max-w-3xl mx-auto text-gray-700 mb-3">
                        From food, language, and festivals to cross‑cultural etiquette, our learning modules and games spark
                        curiosity while fostering respect and inclusivity through engaging,
                        hands‑on activities.
                    </p>


                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {features.map(({ title, icon: Icon, link, description }) => (
                            <div
                                key={title}
                                onClick={() => router.push(link)}
                                className="relative cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
                            >
                                <div className="p-6 flex flex-col items-center text-center space-y-4">
                                    <Icon className="w-12 h-12 text-purple-900" />
                                    <h3 className="text-xl font-semibold text-black">{title}</h3>
                                    <p className="text-sm text-black">{description}</p>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center font-medium rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Learn More
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
