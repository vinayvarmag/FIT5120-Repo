'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Hero images (in public/ folder)
const heroSlides = [
    '/slide1.jpg',
    '/slide2.jpg',
    '/slide3.jpg',
];

// Feature cards
const features = [
    { title: 'Games', description: 'Step into a world of fun cultural games! From language match‑ups to global trivia and role‑play adventures.', icon: '/Games.png', link: '/Games' },
    { title: 'Event Calendar', description: 'Discover local and international events happening throughout the year.', icon: '/Calendar.png', link: '/EventCalendar' },
    { title: 'Exchange Program', description: 'Make friends across the world! Join global classrooms, exchange letters, or team up on cultural projects.', icon: '/Exchange.png', link: '/ExchangeProgram' },
    { title: 'Event Planner', description: 'Plan events across the world!', icon: '/EventPlanner.png', link: '/EventPlanner' },
    { title: 'Culture Awareness', description: 'Uncover stories, traditions, and values from different cultures.', icon: '/Awareness.png', link: '/Awareness' },
];

/**
 * HeroSection: displays and rotates between multiple background images
 */
function HeroSection({ onExplore }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Image rotation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full h-[calc(100vh-80px)] bg-center bg-cover transition-all duration-1000"
                 style={{ backgroundImage: `url(${heroSlides[currentSlide]})` }}
        >
            {/* Image fallback background to prevent black screen when images don't load */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 z-0"></div>

            {/* Content overlay */}
            <div className="absolute inset-0 bg-opacity-1 lex flex-col items-center justify-center text-center px-6 z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
                    United by Culture
                </h1>
                <p className="text-lg md:text-2xl text-gray-200 mb-6 max-w-2xl">
                    Fostering cultural understanding through interactive learning experiences that bring people together across borders and traditions.
                </p>
                <button
                    onClick={onExplore}
                    className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition"
                >
                    Explore Events
                </button>

                {/* Slide indicators */}
                <div className="absolute bottom-6 flex space-x-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white' : 'bg-gray-400 bg-opacity-50'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    const router = useRouter();

    return (
        <main className="w-full">
            <HeroSection onExplore={() => router.push('/EventCalendar')} />

            {/* features section */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        Discover Cultural Activities
                    </h2>
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {features.map((item) => (
                            <div
                                key={item.title}
                                onClick={() => router.push(item.link)}
                                className="relative cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 flex flex-col justify-between"
                            >
                                <div className="p-6 flex flex-col items-center text-center space-y-4">
                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        className="w-12 h-12 object-contain"
                                    />
                                    <h3 className="text-xl font-semibold">{item.title}</h3>
                                    <p className="text-gray-600 text-sm">{item.description}</p>
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