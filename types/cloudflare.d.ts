// types/cloudflare.d.ts
import type { D1Database } from '@cloudflare/workers-types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
    }
  }
}

// Extend Next.js API route types
declare module 'next' {
  interface NextApiRequest {
    env?: {
      DB: D1Database;
    };
  }
}

export {};
