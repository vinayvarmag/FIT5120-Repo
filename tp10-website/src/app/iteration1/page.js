"use client";

import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
    const router = useRouter();

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>CultureEventPlanner</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            {/* Tailwind Config Script – loaded before interactivity */}
            <Script id="tailwind-config" strategy="beforeInteractive">
                {`
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#6b21a8',
                  secondary: '#f5f5f5'
                },
                borderRadius: {
                  none: '0px',
                  sm: '4px',
                  DEFAULT: '8px',
                  md: '12px',
                  lg: '16px',
                  xl: '20px',
                  '2xl': '24px',
                  '3xl': '32px',
                  full: '9999px',
                  button: '8px'
                },
                animation: {
                  backgroundChange: 'backgroundChange 20s infinite'
                },
                keyframes: {
                  backgroundChange: {
                    '0%': { opacity: '0' },
                    '5%': { opacity: '1' },
                    '45%': { opacity: '1' },
                    '50%': { opacity: '0' },
                    '100%': { opacity: '0' },
                  }
                }
              }
            }
          }
        `}
            </Script>

            {/* Load Tailwind via CDN */}
            <Script src="https://cdn.tailwindcss.com/3.4.16" strategy="beforeInteractive" />

            {/* Custom fonts and icons – for global use, consider moving these to pages/_document.js */}
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
                    rel="stylesheet"
                />
            </Head>

            <main className="w-full min-h-[calc(100vh-80px)] relative">
                {/* HERO SECTION */}
                <section className="relative w-full h-[calc(100vh-80px)] overflow-hidden ">
                    {/* Background Images */}
                    <div
                        className="bg-image opacity-0"
                        style={{ backgroundImage: "url('/slide1.jpg')" }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{ backgroundImage: "url('/slide2.jpg')" }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{ backgroundImage: "url('/slide3.jpg')" }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{ backgroundImage: "url('/slide4.png')" }}
                    ></div>

                    {/* White Trapezoid Overlay */}
                    <div className="absolute inset-0 trapezoid-overlay"></div>

                    {/* Hero Content */}
                    <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                        <div className="max-w-2xl">
                            {/* UNITED BY (with black overlay) */}
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                                <h2 className="handwritten text-4xl md:text-5xl text-white mb-2 relative z-10 pl-6">
                                    UNITED BY
                                </h2>
                            </div>
                            {/* CULTURE (with purple overlay) */}
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-primary bg-opacity-90 transform skew-x-[-15deg] origin-top-left"></div>
                                <h1 className="text-6xl md:text-[7rem] font-bold text-purple-900 mb-4 relative z-10 pl-6">
                                    CULTURE
                                </h1>
                            </div>
                            {/* POWERED BY PLAY (with black overlay) */}
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-black bg-opacity-60 transform skew-x-[-15deg] origin-top-left"></div>
                                <h3 className="handwritten text-3xl md:text-4xl font-semibold text-white mb-4 relative z-10 pl-6">
                                    POWERED BY PLAY
                                </h3>
                            </div>
                            <p className="text-xl md:text-2xl text-black max-w-xl mt-8">
                                Fostering cultural understanding through interactive learning experiences that bring people together across borders and traditions.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <button  onClick={() => router.push("/EventCalendar")}
                                    className="bg-purple-900 text-white px-8 py-4 text-lg md:text-xl rounded-md font-semibold transition-all whitespace-nowrap">
                                    Explore Events

                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LANGUAGE ACTIVITIES SECTION */}
                <section className="relative py-10 px-6 text-center overflow-hidden">
                    {/* Language background */}
                    <div className="absolute inset-0 z-0 bg-[url('/Language.png')] bg-repeat-x bg-center bg-contain bg-white opacity-0"></div>
                    <h2 className="relative z-10 text-2xl font-bold mb-8 text-white">
                        Discover Cultural Activities
                    </h2>
                    <div className="relative z-10 flex flex-row flex-nowrap gap-6 justify-center items-center text-purple-900">
                        {[
                            {
                                title: "Games",
                                description: "Step into a world of fun cultural games! From language match-ups to global trivia and role-play adventures",
                                icon: "/Games.png",
                                link: "/Games",
                            },
                            {
                                title: "Event Calendar",
                                description: "Discover local and international events happening throughout the year.",
                                icon: "/Calendar.png",
                                link: "/EventCalendar",
                            },
                            {
                                title: "Exchange Program",
                                description: "Make friends across the world! Join global classrooms, exchange letters, or team up on cultural projects.",
                                icon: "/Exchange.png",
                                link: "/ExchangeProgram",
                            },
                            {
                                title: "Event Planner",
                                description: "Plan Events across the world!",
                                icon: "/EventPlanner.png",
                                link: "/EventPlanner",

                            },
                            {
                                title: "Culture Awareness",
                                description: "Uncover stories, traditions, and values from different cultures.",
                                icon: "/Awareness.png",
                                link: "/Awareness",
                            },
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
                                <p className="text-sm text-black mt-2">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <style jsx>{`
        /* Background image base styles */
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          animation: backgroundChange 20s infinite;
        }
        .bg-image:nth-child(1) {
          animation-delay: 0s;
        }
        .bg-image:nth-child(2) {
          animation-delay: 5s;
        }
        .bg-image:nth-child(3) {
          animation-delay: 10s;
        }
        .bg-image:nth-child(4) {
          animation-delay: 15s;
        }
        @keyframes backgroundChange {
          0% {
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          45% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        .handwritten {
          font-family: "Caveat", cursive;
        }
        /* White trapezoid overlay */
        .trapezoid-overlay {
          clip-path: polygon(0 25%, 100% 25%, 80% 75%, 0 75%);
          background-color: white;
          opacity: 0.6;
        }
      `}</style>
        </>
    );
}
