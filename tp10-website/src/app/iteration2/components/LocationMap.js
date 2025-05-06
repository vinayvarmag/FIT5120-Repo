'use client';

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import useSWR from 'swr';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// SWR caching options for client-side speed
const swrOptions = { dedupingInterval: 600000, revalidateOnFocus: false };

// Simple data fetcher
const fetcher = url => fetch(url).then(res => res.json());

// Hook to update GeoJSON styles on map when styleFn changes
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

/**
 * LocationMap: renders a Leaflet map with GeoJSON boundaries.
 * Props:
 *  - center: [lat, lon]
 *  - zoom: number
 *  - bounds: [[lat1,lon1],[lat2,lon2]]
 *  - className: CSS sizing
 *  - styleFn: feature => style object
 *  - onEachFn: (feature, layer) => void
 */
export default function LocationMap({ center, zoom, bounds, className, styleFn, onEachFn }) {
    // Fetch boundaries with caching
    const { data, error } = useSWR('/api/locations', fetcher, swrOptions);

    if (error) {
        console.error('Error loading locations:', error);
        return null;
    }

    return (
        <MapContainer center={center} zoom={zoom} bounds={bounds} className={className}>
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