'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import useSWR from 'swr';
import 'leaflet/dist/leaflet.css';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function LocationMap() {
    const { data } = useSWR('/api/locations', fetcher);

    return (
        <MapContainer
            center={[-37.81, 144.96]}   /* Melbourne */
            zoom={6}
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
            />

            {data && (
                <GeoJSON
                    data={data}
                    onEachFeature={(feature, layer) => {
                        if (feature.properties?.name) {
                            layer.bindTooltip(feature.properties.name, {
                                permanent: false,
                                direction: 'top',
                            });
                        }
                    }}
                    style={{ weight: 2, color: '#3388ff', fillOpacity: 0.2 }}
                />
            )}
        </MapContainer>
    );
}