// app/api/traffic/route.ts
import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

interface TrafficLight {
  id: number;
  location: string;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

interface Env {
  DB: D1Database;
}

export const runtime = 'edge';

// Mock data for development
const mockTrafficLight: TrafficLight = {
  id: 1,
  location: 'Main Street',
  status: 'red',
  last_updated: new Date().toISOString()
};

export async function GET(request: NextRequest, context: { env?: Env }) {
  try {
    // Check if we're in development without DB
    if (!context.env?.DB) {
      console.warn('No DB binding found, using mock data');
      return new Response(JSON.stringify(mockTrafficLight), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = await context.env.DB.prepare(
      `SELECT id, location, status, last_updated 
       FROM traffic_lights 
       WHERE id = 1`
    );
    const result = await stmt.first<TrafficLight>();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Traffic light not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // In development, fall back to mock data
    if (!context.env?.DB) {
      return new Response(JSON.stringify(mockTrafficLight), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch traffic light status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest, context: { env?: Env }) {
  try {
    const { status } = await request.json() as { status?: 'red' | 'yellow' | 'green' };
    
    if (!status || !['red', 'yellow', 'green'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if we're in development without DB
    if (!context.env?.DB) {
      console.warn('No DB binding found, using mock data');
      mockTrafficLight.status = status;
      mockTrafficLight.last_updated = new Date().toISOString();
      return new Response(JSON.stringify({ success: true, status }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = await context.env.DB.prepare(
      `UPDATE traffic_lights 
       SET status = ?, last_updated = CURRENT_TIMESTAMP 
       WHERE id = 1`
    );
    await stmt.bind(status).run();

    return new Response(JSON.stringify({ success: true, status }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update traffic light status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}