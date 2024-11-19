// app/api/traffic/route.ts
import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

interface Env {
  DB: D1Database;
}

export const runtime = 'edge';

export async function GET(request: NextRequest, ctx: { env: Env }) {
  if (!ctx.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
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
    return new Response(JSON.stringify({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest, ctx: { env: Env }) {
  if (!ctx.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
      return new Response(JSON.stringify({ error: 'Failed to update traffic light' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Add a debug endpoint to check database connection
export async function OPTIONS(request: NextRequest, ctx: { env: Env }) {
  return new Response(JSON.stringify({
    databaseAvailable: !!ctx.env?.DB,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}