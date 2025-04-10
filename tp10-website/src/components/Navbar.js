"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    // State to toggle mobile menu
    const [isOpen, setIsOpen] = useState(false);
    // State to control navbar visibility based on scroll direction
    const [isVisible, setIsVisible] = useState(true);
    // Ref to hold the previous scroll position (initially set to 0)
    const prevScrollPos = useRef(0);
    // Get the current pathname for active link styling
    const pathname = usePathname();

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
            prevScrollPos.current = currentScrollPos;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Helper to return classes for desktop links based on active route
    const getLinkClasses = (href) => {
        const baseClasses =
            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
        const activeClasses = "border-indigo-500 text-black";
        const inactiveClasses =
            "border-transparent text-black hover:text-gray-700 hover:border-gray-300";
        return `${baseClasses} ${pathname === href ? activeClasses : inactiveClasses}`;
    };

    // Helper to return classes for mobile links based on active route
    const getMobileLinkClasses = (href) => {
        const baseClasses = "block pl-3 pr-4 py-2 border-l-4 text-base font-medium";
        const activeClasses = "border-indigo-500 text-indigo-700 bg-indigo-50";
        const inactiveClasses =
            "border-transparent text-black hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300";
        return `${baseClasses} ${pathname === href ? activeClasses : inactiveClasses}`;
    };

    return (
        // Added a semi-transparent background and mix-blend-mode style for blending with the page
        <nav
            style={{ mixBlendMode: "multiply" }}
            className={`fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow transition-transform duration-300 ease-in-out ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo on the far left */}
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-xl font-bold text-black">MyLogo</span>
                        </Link>
                    </div>
                    {/* Desktop Navigation Links on the right */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-8">
                        <Link href="/" className={getLinkClasses("/")}>
                            Home
                        </Link>
                        <Link href="/Games" className={getLinkClasses("/Games")}>
                            Games
                        </Link>
                        <Link href="/EventCalendar" className={getLinkClasses("/EventCalendar")}>
                            Event Calendar
                        </Link>
                        <Link href="/ExchangeProgram" className={getLinkClasses("/ExchangeProgram")}>
                            Exchange Program
                        </Link>
                        <Link href="/EventPlanner" className={getLinkClasses("/EventPlanner")}>
                            Culture Event Planner
                        </Link>
                    </div>
                    {/* Mobile Menu Toggle */}
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
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                // Hamburger Icon
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/" className={getMobileLinkClasses("/")}>
                            Home
                        </Link>
                        <Link href="/Games" className={getMobileLinkClasses("/Games")}>
                            Games
                        </Link>
                        <Link href="/EventCalendar" className={getMobileLinkClasses("/EventCalendar")}>
                            Event Calendar
                        </Link>
                        <Link href="/ExchangeProgram" className={getMobileLinkClasses("/ExchangeProgram")}>
                            Exchange Program
                        </Link>
                        <Link href="/EventPlanner" className={getMobileLinkClasses("/EventPlanner")}>
                            Culture Event Planner
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
