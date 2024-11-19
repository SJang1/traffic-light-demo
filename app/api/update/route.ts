// app/api/update/route.ts
import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

// Types for request validation
interface UpdateRequest {
  status?: 'red' | 'yellow' | 'green';
  distance_cm?: number;
}

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

export const runtime = 'edge';

// Helper function to validate the request body
function validateUpdateRequest(data: any): { isValid: boolean; error?: string } {
  if (!data) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { status, distance_cm } = data as UpdateRequest;

  // If neither field is provided
  if (status === undefined && distance_cm === undefined) {
    return { isValid: false, error: 'At least one of status or distance_cm must be provided' };
  }

  // Validate status if provided
  if (status !== undefined && !['red', 'yellow', 'green'].includes(status)) {
    return { isValid: false, error: 'Invalid status. Must be red, yellow, or green' };
  }

  // Validate distance if provided
  if (distance_cm !== undefined) {
    if (typeof distance_cm !== 'number') {
      return { isValid: false, error: 'distance_cm must be a number' };
    }
    if (distance_cm < 0) {
      return { isValid: false, error: 'distance_cm must be non-negative' };
    }
    if (!Number.isFinite(distance_cm)) {
      return { isValid: false, error: 'distance_cm must be a finite number' };
    }
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const db = process.env.DB;
    
    if (!db) {
      return new Response(JSON.stringify({
        error: 'Database not available'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    let body: UpdateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate the request
    const validation = validateUpdateRequest(body);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        error: validation.error
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { status, distance_cm } = body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (distance_cm !== undefined) {
      updates.push('distance_cm = ?');
      values.push(distance_cm);
    }
    updates.push('last_updated = CURRENT_TIMESTAMP');

    // Prepare and execute the update query
    const stmt = await db.prepare(
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

    return new Response(JSON.stringify({
      message: 'Update successful',
      data: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Update error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to update traffic light',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Add OPTIONS method for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}