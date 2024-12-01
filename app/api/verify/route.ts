// app/api/verify/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, ctx: any) {
  const env = ctx?.env;
  
  // Check if DB binding exists
  if (!env?.DB) {
    return new Response(JSON.stringify({
      error: 'Database binding not found',
      debug: {
        hasEnv: !!env,
        envKeys: env ? Object.keys(env) : [],
        url: request.url,
        method: request.method,
      }
    }, null, 2), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Try to query the database
    const stmt = await env.DB.prepare(
      'SELECT * FROM traffic_lights WHERE id = 1'
    );
    const result = await stmt.first();

    return new Response(JSON.stringify({
      success: true,
      databaseConnected: true,
      data: result,
      debug: {
        hasEnv: !!env,
        envKeys: Object.keys(env),
        url: request.url,
        method: request.method,
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Database query failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        hasEnv: !!env,
        envKeys: Object.keys(env),
        url: request.url,
        method: request.method,
      }
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}