"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const prevScrollPos = useRef(0);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setIsVisible(currentScrollPos < prevScrollPos.current);
            prevScrollPos.current = currentScrollPos;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getLinkClasses = (href) => {
        const base = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-high drop-shadow-lg outline outline-1 outline-white";
        const active = "border-indigo-500 text-black";
        const inactive = "border-transparent text-black hover:text-gray-700 hover:border-gray-300";
        return `${base} ${pathname === href ? active : inactive}`;
    };

    const getMobileLinkClasses = (href) => {
        const base = "block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-bold drop-shadow-lg outline outline-1 outline-white";
        const active = "border-indigo-500 text-indigo-700 bg-indigo-50";
        const inactive = "border-transparent text-black hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300";
        return `${base} ${pathname === href ? active : inactive}`;
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out   ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <span className="text-xl font-bold text-black drop-shadow-lg outline-white">Divercity</span>
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-8 flex-1 justify-end ">
                        <Link href="/Games" className={getLinkClasses("/Games")}>Games</Link>
                        <Link href="/EventPlanner" className={getLinkClasses("/EventPlanner")}>Culture Event Planner</Link>
                        <Link href="/Awareness" className={getLinkClasses("/Awareness")}>Culture Awareness</Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Links */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/Games" className={getMobileLinkClasses("/Games")}>Games</Link>
                        <Link href="/EventPlanner" className={getMobileLinkClasses("/EventPlanner")}>Culture Event Planner</Link>
                        <Link href="/Awareness" className={getMobileLinkClasses("/Awareness")}>Culture Awareness</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
