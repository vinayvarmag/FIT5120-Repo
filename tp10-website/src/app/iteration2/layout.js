import Script from "next/script";
import "./globals.css";
import Navbar from "../../components/Navbar";
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
            {/* Inject Tailwind config and enable dark mode */}
            <Script id="tailwind-config" strategy="beforeInteractive">
                {`tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F3E8FF',
          dark:    '#C4B5FD',
        },
        secondary: '#f5f5f5',
      },
      borderRadius: {
        none:    '0px',
        sm:      '4px',
        DEFAULT: '8px',
        md:      '12px',
        lg:      '16px',
        xl:      '20px',
        '2xl':   '24px',
        '3xl':   '32px',
        full:    '9999px',
        button:  '8px',
      },
    },
  },
};`}
            </Script>

            {/* Theme detection based on user preference */}
            <Script id="theme-script" strategy="beforeInteractive">
                {`(function() {
  function setTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  setTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
})();`}
            </Script>
        </head>
        <body className="bg-secondary
                  dark:bg-secondary-dark
                  text-black
                  dark:text-black
                   antialiased">
        <Navbar />
        {children}
        </body>
        </html>
    );
}
