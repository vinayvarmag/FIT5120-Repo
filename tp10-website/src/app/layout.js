// src/app/layout.js
import "./globals.css";
import Navbar  from "../components/Navbar";
import Footer  from "../components/Footer";

import { Poppins, Source_Sans_3 } from "next/font/google";

/* ── Google fonts ──────────────────────────────────── */
const poppins = Poppins({
    subsets: ["latin"],
    weight:  ["600", "700"],      // headings/display
    variable: "--font-poppins",   // exposes a CSS custom property
});

const sourceSans = Source_Sans_3({
    subsets: ["latin"],
    weight:  ["400", "600"],      // body copy
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
            /* attach both font variables to <html> */
            className={`${poppins.variable} ${sourceSans.variable}`}
        >
        {/* set Source Sans Pro as default body font with Tailwind’s `font-sans` */}
        <body className="bg-secondary text-black antialiased font-sans">
        {/* wrapper keeps footer at the bottom even on short pages */}
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
        </body>
        </html>
    );
}
