"use client";

export default function Footer() {
    return (
        <footer className="w-full py-6 text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} TEN OUT OF TEN
        </footer>
    );
}
