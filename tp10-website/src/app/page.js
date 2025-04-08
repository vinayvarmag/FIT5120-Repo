'use client';

import Head from 'next/head';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>CultureEventPlanner</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                {/* Define Tailwind config before loading Tailwind's script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
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
                  },
                },
              }
            `,
                    }}
                />

                {/* Now load Tailwind via CDN */}
                <script src="https://cdn.tailwindcss.com/3.4.16"></script>

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <header className="w-full bg-white shadow-sm">
                <nav className="container mx-auto px-4 py-4">
                    <ul className="flex flex-wrap items-center space-x-6 md:space-x-10">
                        <li>
                            <a
                                href="#"
                                className="text-gray-800 font-semibold hover:text-primary transition-colors"
                            >
                                HOME
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="text-gray-800 font-semibold hover:text-primary transition-colors"
                            >
                                GAMES
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="text-gray-800 font-semibold hover:text-primary transition-colors"
                            >
                                EVENTS CALENDAR
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="text-gray-800 font-semibold hover:text-primary transition-colors"
                            >
                                EXCHANGE PROGRAM
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="text-gray-800 font-semibold hover:text-primary transition-colors"
                            >
                                CultureEventPlanner
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>

            <main className="w-full min-h-[calc(100vh-80px)] relative">
                <section className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
                    {/* Background Images from the public folder */}
                    <div
                        className="bg-image"
                        style={{
                            backgroundImage: "url('/slide1.jpg')",
                        }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{
                            backgroundImage: "url('/slide2.jpg')",
                        }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{
                            backgroundImage: "url('/slide3.jpg')",
                        }}
                    ></div>
                    <div
                        className="bg-image"
                        style={{
                            backgroundImage: "url('/slide4.png')",
                        }}
                    ></div>

                    {/* White Trapezoid Overlay with a Straight Left and More Transparency */}
                    <div className="absolute inset-0 trapezoid-overlay"></div>

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                        <div className="max-w-2xl">
                            {/* UNITED BY with black overlay */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                                <h2 className="handwritten text-5xl md:text-6xl text-white mb-2 relative z-10 pl-6">
                                    UNITED BY
                                </h2>
                            </div>
                            {/* CULTURE. with purple overlay */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary bg-opacity-90 transform skew-x-[-15deg] origin-top-left"></div>
                                <h1 className="text-8xl md:text-[12rem] font-bold text-purple-900 mb-4 relative z-10 pl-6">
                                    CULTURE.
                                </h1>
                            </div>
                            {/* POWERED BY PLAY. with black overlay */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-black bg-opacity-60 transform skew-x-[-15deg] origin-top-left"></div>
                                <h3 className="text-4xl md:text-5xl font-semibold text-white mb-4 relative z-10 pl-6">
                                    POWERED BY PLAY.
                                </h3>
                            </div>
                            <p className="text-2xl text-black-200 max-w-xl mt-8">
                                Fostering cultural understanding through interactive learning experiences that bring people together across borders and traditions.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <button className="bg-primary text-white px-8 py-4 text-xl rounded-md font-semibold hover:bg-opacity-90 transition-all whitespace-nowrap">
                                    Explore Events
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Additional sections would go here */}
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
          font-family: 'Caveat', cursive;
        }
        /* White trapezoid overlay with straight left side */
        .trapezoid-overlay {
          clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
          background-color: white;
          opacity: 0.6;
        }
      `}</style>
        </>
    );
}
