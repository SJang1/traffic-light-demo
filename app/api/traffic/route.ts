// app/api/traffic/route.ts
import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

// Define types
interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

interface Env {
  DB: D1Database;
}

interface RouteContext {
  env: Env;
  params: Record<string, string | string[]>;
}

export const runtime = 'edge';

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { env } = context;
    
    if (!env?.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available',
        debug: {
          hasEnv: !!env,
          envKeys: env ? Object.keys(env) : []
        }
      }), {
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
      });
    }

    const stmt = await env.DB.prepare(
      `SELECT id, distance_cm, status, last_updated 
       FROM traffic_lights 
       WHERE id = 1`
    );
    const result = await stmt.first<TrafficLight>();

    if (!result) {
      return new Response(JSON.stringify({
        error: 'No traffic light data found',
        timestamp: new Date().toISOString()
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });

  } catch (error) {
    console.error('Database error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch traffic light data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { env } = context;
    
    if (!env?.DB) {
      return new Response(JSON.stringify({
        error: 'Database not available',
        debug: {
          hasEnv: !!env,
          envKeys: env ? Object.keys(env) : []
        }
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { status, distance_cm } = body as {
      status?: 'red' | 'yellow' | 'green';
      distance_cm?: number;
    };

    // Validate input
    if (status && !['red', 'yellow', 'green'].includes(status)) {
      return new Response(JSON.stringify({
        error: 'Invalid status. Must be red, yellow, or green.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (distance_cm !== undefined && (
      typeof distance_cm !== 'number' || 
      distance_cm < 0 || 
      !Number.isFinite(distance_cm)
    )) {
      return new Response(JSON.stringify({
        error: 'Invalid distance. Must be a non-negative number.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build update query
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

    // Execute update
    const stmt = await env.DB.prepare(
      `UPDATE traffic_lights 
       SET ${updates.join(', ')}
       WHERE id = 1
       RETURNING *`
    );
    const result = await stmt.bind(...values).first<TrafficLight>();

    if (!result) {
      return new Response(JSON.stringify({
        error: 'Failed to update traffic light'
      }), {
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
      error: 'Failed to update traffic light',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}