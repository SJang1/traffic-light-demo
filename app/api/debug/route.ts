// app/api/debug/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, ctx: any) {
  return new Response(JSON.stringify({
    env: {
      hasDB: !!ctx?.env?.DB,
      envKeys: ctx?.env ? Object.keys(ctx.env) : [],
      dbType: ctx?.env?.DB ? typeof ctx.env.DB : 'undefined',
    },
    context: {
      hasContext: !!ctx,
      contextKeys: ctx ? Object.keys(ctx) : [],
    },
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}