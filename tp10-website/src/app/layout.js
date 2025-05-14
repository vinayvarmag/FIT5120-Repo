// src/app/layout.js
import "./globals.css";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";
import { AuthProvider } from "@/context/AuthContext";

import { Poppins, Source_Sans_3 } from "next/font/google";

/* ── Google fonts ──────────────────────────────────── */
const poppins = Poppins({
    subsets: ["latin"],
    weight:  ["600", "700"],
    variable: "--font-poppins",
});

const sourceSans = Source_Sans_3({
    subsets: ["latin"],
    weight:  ["400", "600"],
    variable: "--font-source",
});
/* ──────────────────────────────────────────────────── */

export const metadata = {
    title:       "TP10 Website",
    description: "Website made by TP10",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${poppins.variable} ${sourceSans.variable}`}
        >
        <body className="bg-secondary text-black antialiased font-sans">
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}
