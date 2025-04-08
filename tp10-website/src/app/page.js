'use client';
import '../app/globals.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const images = [
    "/slide1.jpg",
    "/slide2.jpg",
    "/slide3.jpg",
    "/slide4.png"
];

export default function Home() {
    const router = useRouter();

    return (
        <>
        {/* Background slideshow */}
            <div className="relative w-full h-[80vh] overflow-hidden bg-gray-100">
                <div className="absolute inset-0 z-0">
                    {images.map((src, index) => (
                        <div
                            key={index}
                            className="absolute inset-0 w-full h-full opacity-0 animate-fadeInOut"
                            style={{ animationDelay: `${index * 6}s`, zIndex: images.length - index }}
                        >
                            <Image
                                src={src}
                                alt={`Slide ${index + 1}`}
                                fill
                                className="object-cover opacity-0 "
                            />
                        </div>
                    ))}
                </div>

                {/* Overlay text */}
                <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-center items-center text-center text-white px-4">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">Understanding Different Cultures</h1>
                    <p className="text-lg sm:text-xl mb-6">In Australia</p>
                    <button className="bg-white text-black font-semibold px-6 py-2 rounded shadow hover:bg-gray-100 transition">
                        Start Exploring
                    </button>
                </div>
            </div>

            {/* Card section */}
            <section className="relative py-10 px-6 text-center overflow-hidden">
                {/* Language background */}
                <div className="absolute inset-0 z-0 bg-[url('/Language.jpg')] bg-repeat-x bg-center bg-contain opacity-50"></div>
                <h2 className="relative z-10 text-2xl font-bold mb-8">Discover Cultural Activities</h2>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                    {[
                        {
                            title: "Games",
                            description: "Engage in fun cultural games",
                            icon: "/Games.png",
                            link: "/Games"
                        },
                        {
                            title: "Event Calendar",
                            description: "See local & global events",
                            icon: "/Calendar.png",
                            link: "/EventCalendar"
                        },
                        {
                            title: "Exchange Program",
                            description: "Learn globally through programs",
                            icon: "/Exchange.png",
                            link: "/ExchangeProgram"
                        },
                        {
                            title: "Culture Awareness",
                            description: "Understand cultural perspectives",
                            icon: "/Awareness.png"
                        }
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-md w-full max-w-xs text-left cursor-pointer hover:shadow-lg transition"
                            onClick={() => item.link && router.push(item.link)}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Image
                                    src={item.icon}
                                    alt={item.title}
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                                <h3 className="text-lg font-bold">{item.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}