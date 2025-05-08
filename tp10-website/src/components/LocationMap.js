"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import useSWR from "swr";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const swrOptions = { dedupingInterval: 600_000, revalidateOnFocus: false };
const fetcher    = url => fetch(url).then(r => r.json());

function UpdateGeoJsonStyle({ styleFn }) {
    const map = useMap();
    useEffect(() => {
        map.eachLayer(layer => {
            if (layer.feature) {
                layer.setStyle(styleFn(layer.feature));
            }
        });
    }, [styleFn, map]);
    return null;
}

export default function LocationMap({
                                        center,
                                        zoom,
                                        bounds,
                                        className,
                                        styleFn,
                                        onEachFn,
                                    }) {
    const { data, error } = useSWR("/api/locations", fetcher, swrOptions);

    if (error) {
        console.error("Error loading locations:", error);
        return null;
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            bounds={bounds}
            className={className}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
            />
            {data && (
                <>
                    <GeoJSON
                        key={JSON.stringify(styleFn)}
                        data={data}
                        style={styleFn}
                        onEachFeature={onEachFn}
                    />
                    <UpdateGeoJsonStyle styleFn={styleFn} />
                </>
            )}
        </MapContainer>
    );
}
