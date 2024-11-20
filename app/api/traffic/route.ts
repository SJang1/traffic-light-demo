import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = process.env.DB as unknown as D1Database;

    if (!db) {
      return new Response(JSON.stringify({
        error: 'Database not available',
        debug: {
          envKeys: Object.keys(process.env),
        },
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Fetch data for both traffic lights
    const stmt = await db.prepare(
      `SELECT id, distance_cm, status, last_updated 
       FROM traffic_lights 
       WHERE id IN (1, 2)`
    );
    const result = await stmt.all<TrafficLight>();

    // Ensure rows exist and extract them
    const rows = result.results;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({
        error: 'No traffic light data found',
        timestamp: new Date().toISOString(),
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Map results by ID for easier frontend processing
    const response = rows.reduce((acc, light) => {
      acc[light.id] = light;
      return acc;
    }, {} as Record<number, TrafficLight>);

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    console.error('Database error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to fetch traffic light data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}
