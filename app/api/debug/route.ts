// app/api/debug/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, context: any) {
  // Check both ways to access DB
  const processEnvDB = process.env.DB;
  const contextDB = context?.env?.DB;

  return new Response(JSON.stringify({
    processEnv: {
      hasDB: !!processEnvDB,
      type: typeof processEnvDB,
      keys: Object.keys(process.env),
    },
    context: {
      hasDB: !!contextDB,
      type: typeof contextDB,
      hasEnv: !!context?.env,
      envKeys: context?.env ? Object.keys(context.env) : [],
    },
    runtime: {
      isEdge: process.env.NEXT_RUNTIME === 'edge',
      environment: process.env.NODE_ENV,
    }
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}