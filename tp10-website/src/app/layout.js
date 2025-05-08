import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";   // ← add this line
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

export const metadata = {
    title: "TP10 Website",
    description: "Website made by TP10",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={poppins.className}>
        <body className="bg-secondary text-black antialiased">
        {/* Layout wrapper so the footer hugs the bottom
                   even on short pages */}
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />          {/* ← render footer here */}
        </div>
        </body>
        </html>
    );
}
