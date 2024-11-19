// types/env.d.ts
import { D1Database } from '@cloudflare/workers-types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
    }
  }
}

// Extend Next.js context types
declare module 'next' {
  interface NextApiRequest {
    env: {
      DB: D1Database;
    };
  }
}

export {};