"use client";

import React, { useState, useEffect } from "react";

export default function LocationSearch({ value, onChange }) {
    const [query, setQuery] = useState(value || "");
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (query.length > 2) {
            // Function to fetch suggestions from the existing venues API
            const fetchVenues = async () => {
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
                    // Assuming the response contains a "results" array
                    return data.results || [];
                } catch (error) {
                    console.error("Error fetching venues:", error);
                    return [];
                }
            };

            // Function to fetch suggestions from the new places API (autocomplete)
            const fetchNewPlaces = async () => {
                try {
                    // Replace this URL with your actual new places API endpoint
                    const endpoint = "https://new-places-api.example.com/autocomplete";
                    const params = new URLSearchParams({
                        query: query,
                        limit: "10",
                    });
                    const url = `${endpoint}?${params.toString()}`;
                    const res = await fetch(url);
                    const data = await res.json();
                    return data.results || [];
                } catch (error) {
                    console.error("Error fetching new places:", error);
                    return [];
                }
            };

            // Fetch both APIs concurrently and merge the results
            const fetchAllSuggestions = async () => {
                const [venues, newPlaces] = await Promise.all([
                    fetchVenues(),
                    fetchNewPlaces(),
                ]);
                // Merge the two arrays
                const merged = [...venues, ...newPlaces];
                // Optional: De-duplicate suggestions by full_name
                const unique = merged.reduce((acc, item) => {
                    if (!acc.find((existing) => existing.full_name === item.full_name)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                setSuggestions(unique);
            };

            fetchAllSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [query]);

    // Push query changes to the parent component
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
