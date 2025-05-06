// File: src/app/api/data/route.js
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Reuse a single pool across requests instead of creating a new Client each time
const pool = new Pool({
    connectionString: process.env.PG_CONN,
});

export async function GET() {
    // Pull straight from your cached/generated geojson column
    const sql = `
    SELECT
      location_id    AS id,
      location_name  AS name,
      location_geojson AS geometry
    FROM public.location;
  `;

    // Use the shared pool
    const { rows } = await pool.query(sql);

    // Assemble into a proper FeatureCollection
    const geojson = {
        type: 'FeatureCollection',
        features: rows.map(r => ({
            type: 'Feature',
            id: r.id,
            properties: { name: r.name },
            geometry: r.geometry,
        })),
    };

    return NextResponse.json(geojson);
}
