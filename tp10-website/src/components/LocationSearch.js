"use client";

import React, { useState, useEffect } from "react";

export default function LocationSearch({ value, onChange }) {
    const [query, setQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState([]);

    // Fetch suggestions when query is longer than 2 characters
    useEffect(() => {
        if (query.length > 2) {
            const fetchSuggestions = async () => {
                try {
                    const endpoint =
                        "https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/venues-for-event-bookings/records";
                    const params = new URLSearchParams({
                        select: "full_name",
                        where: `suggest(full_name, '${query}')`,
                        limit: "20",
                    });
                    const url = `${endpoint}?${params.toString()}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    // The API returns an object with a "results" array
                    setSuggestions(data.results || []);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [query]);

    // Propagate query changes to the parent component
    useEffect(() => {
        onChange(query);
    }, [query, onChange]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-black"
                placeholder="Enter location"
            />
            <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                setQuery(item.full_name);
                                setSuggestions([]);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                        >
                            {item.full_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}