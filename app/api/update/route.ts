import { NextRequest } from 'next/server';
import type { D1Database } from '@cloudflare/workers-types';

// Types for request validation
interface UpdateRequest {
  status: 'red' | 'yellow' | 'green';
  distance_cm: number;
}

interface TrafficLight {
  id: number;
  distance_cm: number;
  status: 'red' | 'yellow' | 'green';
  last_updated: string;
}

export const runtime = 'edge';

// Helper function to validate individual traffic light data
function validateTrafficLightData(data: any): { isValid: boolean; error?: string } {
  if (!data) {
    return { isValid: false, error: 'Data is required' };
  }

  let { status, distance_cm } = data;

  // Treat undefined distance_cm as -1
  if (distance_cm === undefined) {
    distance_cm = -1;
  }

  if (status && !['red', 'yellow', 'green'].includes(status)) {
    return { isValid: false, error: 'Invalid status. Must be red, yellow, or green.' };
  }

  if (distance_cm < -1 || typeof distance_cm !== 'number') {
    return { isValid: false, error: 'distance_cm must be -1 or a non-negative number.' };
  }

  return { isValid: true };
}


// POST handler for updating traffic light statuses
export async function POST(request: NextRequest) {
  try {
    const db = process.env.DB as D1Database;

    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: Record<string, UpdateRequest>;

    // Parse the incoming request body as JSON
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const errors = [];
    const updates = [];

    // Iterate over each ID in the request body
    for (const id in body) {
      const trafficLightData = body[id];
      const validation = validateTrafficLightData(trafficLightData);

      if (!validation.isValid) {
        errors.push({ id, error: validation.error });
        continue;
      }

      const { status, distance_cm } = trafficLightData;

      const updateQueryParts = [];
      const values: any[] = [];

      if (status) {
        updateQueryParts.push('status = ?');
        values.push(status);
      }

      if (distance_cm !== undefined) {
        updateQueryParts.push('distance_cm = ?');
        values.push(distance_cm);
      }

      updateQueryParts.push('last_updated = CURRENT_TIMESTAMP');

      const updateQuery = `
        UPDATE traffic_lights
        SET ${updateQueryParts.join(', ')}
        WHERE id = ?
        RETURNING *;
      `;

      values.push(parseInt(id));

      try {
        const result = await db.prepare(updateQuery).bind(...values).first<TrafficLight>();
        if (result) {
          updates.push({ id, result });
        } else {
          errors.push({ id, error: 'Failed to update traffic light.' });
        }
      } catch (dbError) {
        const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
        errors.push({ id, error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Processed updates',
        updates,
        errors,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Unexpected error while processing updates',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
