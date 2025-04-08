"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
    // State to toggle mobile menu
    const [isOpen, setIsOpen] = useState(false);
    // State to control navbar visibility based on scroll direction
    const [isVisible, setIsVisible] = useState(true);
    // Ref to hold the previous scroll position (initially set to 0)
    const prevScrollPos = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;

            // Compare current scroll position with previous position
            if (currentScrollPos < prevScrollPos.current) {
                // User is scrolling up, show the navbar
                setIsVisible(true);
            } else {
                // User is scrolling down, hide the navbar
                setIsVisible(false);
            }
            // Set the previous scroll position to the current one for next time
            prevScrollPos.current = currentScrollPos;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        // Use Tailwind transform and transition classes to animate the hide/show behavior
        <nav
            className={`fixed top-0 left-0 w-full z-50 bg-white backdrop-blur-md shadow transition-transform duration-300 ease-in-out ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Desktop Navigation */}
                <div className="flex justify-between h-16">
                    {/* Left side: Logo and navigation links */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <span className="text-xl font-bold text-black">MyLogo</span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium text-black"
                            >
                                Home
                            </Link>
                            <Link
                                href="/Games"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                            >
                                Games
                            </Link>
                            <Link
                                href="/EventCalendar"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                            >
                                Event Calendar
                            </Link>
                            <Link
                                href="/ExchangeProgram"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                            >
                                Exchange Program
                            </Link>
                            <Link
                                href="/EventPlanner"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-black hover:text-gray-700 hover:border-gray-300"
                            >
                                Culture Event Planner
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Mobile menu toggle */}
                    <div className="flex items-center sm:hidden">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                // Close Icon
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                // Hamburger Icon
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            href="/"
                            className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
                        >
                            Home
                        </Link>
                        <Link
                            href="/Games"
                            className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
                        >
                            Games
                        </Link>
                        <Link
                            href="/EventCalendar"
                            className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
                        >
                            Event Calendar
                        </Link>
                        <Link
                            href="/ExchangeProgram"
                            className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
                        >
                            Exchange Program
                        </Link>
                        <Link
                            href="/EventPlanner"
                            className="block pl-3 pr-4 py-2 border-l-4 border-indigo-500 text-base font-medium text-indigo-700 bg-indigo-50"
                        >
                            Culture Event Planner
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
