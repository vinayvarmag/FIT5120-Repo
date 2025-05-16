"use client";
import Script from "next/script";
import { useState } from "react";

export default function DiscoverEvents() {
    const [ready, setReady] = useState(false);

    function onWidgetsLoaded() {
        if (!window.EBWidgets) return;         // script blocked?
        window.EBWidgets.createWidget({
            widgetType:        "event_search",   // ⬅ THIS is the public feed
            widgetContainerId: "eb-discover",    // div → iframe
            city:              "Melbourne",      // try without filters first!
            page_size:         12,               // 1–24 cards
            sortBy:            "best",
            header:            false
        });
        setReady(true);
    }

    return (
        <main className="mx-auto max-w-7xl p-6">
            {/* load the *full* widget bundle – not the checkout-only one */}
            <Script
                src="https://www.eventbrite.com/static/widgets/eb_widgets.js"
                strategy="lazyOnload"
                onLoad={onWidgetsLoaded}
            />

            {/* container the script will replace with an <iframe> */}
            <div id="eb-discover"
                 className="min-h-[600px] w-full rounded-2xl overflow-hidden shadow" />

            {!ready && (
                <p className="mt-4 text-center text-sm text-gray-500">
                    Loading Eventbrite events…
                </p>
            )}
        </main>
    );
}
