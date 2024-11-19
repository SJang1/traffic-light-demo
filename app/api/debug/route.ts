// app/api/debug/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, ctx: any) {
  try {
    // Try to query the database if it exists
    let dbResult = null;
    let dbError = null;

    if (ctx?.env?.DB) {
      try {
        const stmt = await ctx.env.DB.prepare(
          'SELECT * FROM traffic_lights WHERE id = 1'
        );
        dbResult = await stmt.first();
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown DB error';
      }
    }

    return new Response(JSON.stringify({
      database: {
        isAvailable: !!ctx?.env?.DB,
        queryResult: dbResult,
        error: dbError,
      },
      environment: {
        type: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
      },
      context: {
        hasContext: !!ctx,
        contextKeys: ctx ? Object.keys(ctx) : [],
        envKeys: ctx?.env ? Object.keys(ctx.env) : [],
      },
      request: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Debug route error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}