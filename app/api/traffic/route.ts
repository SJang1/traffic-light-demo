// app/api/traffic/route.ts
import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

// Define the environment interface
interface Env {
  DB: D1Database;
}

export const runtime = 'edge';

// Mock data updated with distance
const mockTrafficLight: TrafficLight = {
  id: 1,
  distance_cm: 150,
  status: 'red',
  last_updated: new Date().toISOString()
};

export async function GET(request: NextRequest, ctx: { env: Env }) {
  try {
    if (!ctx.env) {
      console.warn('No environment bindings found, using mock data');
      return new Response(JSON.stringify(mockTrafficLight), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stmt = await ctx.env.DB.prepare(
      `SELECT id, distance_cm, status, last_updated 
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
    return new Response(JSON.stringify({ error: 'Failed to fetch traffic light status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest, ctx: { env: Env }) {
  try {
    const body = await request.json();
    const { status, distance_cm } = body as { 
      status?: 'red' | 'yellow' | 'green';
      distance_cm?: number;
    };
    
    // Validate input
    if (status && !['red', 'yellow', 'green'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (distance_cm !== undefined && (typeof distance_cm !== 'number' || distance_cm < 0)) {
      return new Response(JSON.stringify({ error: 'Invalid distance. Must be a non-negative number.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ctx.env) {
      console.warn('No environment bindings found, using mock data');
      if (status) mockTrafficLight.status = status;
      if (distance_cm !== undefined) mockTrafficLight.distance_cm = distance_cm;
      mockTrafficLight.last_updated = new Date().toISOString();
      return new Response(JSON.stringify(mockTrafficLight), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build the update query dynamically based on what fields are provided
    const updates = [];
    const values = [];
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (distance_cm !== undefined) {
      updates.push('distance_cm = ?');
      values.push(distance_cm);
    }
    updates.push('last_updated = CURRENT_TIMESTAMP');

    const stmt = await ctx.env.DB.prepare(
      `UPDATE traffic_lights 
       SET ${updates.join(', ')}
       WHERE id = 1
       RETURNING *`
    );
    const result = await stmt.bind(...values).first<TrafficLight>();

    if (!result) {
      return new Response(JSON.stringify({ error: 'Failed to update and retrieve traffic light' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update traffic light' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}