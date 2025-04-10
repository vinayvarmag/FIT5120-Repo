import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
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
        <head>
            <title>TP10-Website</title>
            {/* Use next/script to inject Tailwind configuration */}
            <Script id="tailwind-config" strategy="beforeInteractive">
                {`
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: "#6b21a8",
                    secondary: "#f5f5f5"
                  },
                  borderRadius: {
                    none: "0px",
                    sm: "4px",
                    DEFAULT: "8px",
                    md: "12px",
                    lg: "16px",
                    xl: "20px",
                    "2xl": "24px",
                    "3xl": "32px",
                    full: "9999px",
                    button: "8px"
                  },
                },
              },
            }
          `}
            </Script>
        </head>
        <body>
        <Navbar />
        {children}
        </body>
        </html>
    );
}
