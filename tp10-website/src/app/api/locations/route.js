import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
    const client = new Client({
        connectionString: process.env.PG_CONN,
    });
    await client.connect();

    const sql = `
    SELECT
      location_id    AS id,
      location_name  AS name,
      ST_AsGeoJSON(location_boundary)::json AS geometry
    FROM   public.location;
  `;
    const { rows } = await client.query(sql);
    await client.end();

    const geojson = {
        type: 'FeatureCollection',
        features: rows.map((r) => ({
            type: 'Feature',
            id: r.id,
            properties: { name: r.name },
            geometry: r.geometry,
        })),
    };

    return NextResponse.json(geojson);
}
