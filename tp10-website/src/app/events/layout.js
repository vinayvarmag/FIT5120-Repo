"use client";

import { useState } from "react";
import EventSelectorDialog from "@/components/EventSelectorDialog";

export default function EventsLayout({ children }) {
    const [selectorOpen, setSelectorOpen] = useState(false);

    return (
        <>
            {children}

            {/* floating “Select Event” button */}
            <button
                onClick={() => setSelectorOpen(true)}
                className="fixed bottom-6 right-6 bg-purple-900 text-white
                   rounded-full w-14 h-14 shadow-lg flex items-center justify-center
                   hover:scale-105 transition"
                title="Select event"
            >
                <i className="ri-search-line text-xl" />
            </button>

            {/* modal */}
            <EventSelectorDialog
                isOpen={selectorOpen}
                onClose={() => setSelectorOpen(false)}
            />
        </>
    );
}
