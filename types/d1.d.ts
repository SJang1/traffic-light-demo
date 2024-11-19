// types/d1.d.ts
interface D1Result {
    results?: any[];
    success: boolean;
    error?: string;
    meta?: any;
  }
  
  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = any>(colName?: string): Promise<T | null>;
    run<T = D1Result>(): Promise<T>;
    all<T = D1Result>(): Promise<T>;
  }
  
  interface D1Database {
    prepare(query: string): Promise<D1PreparedStatement>;
    batch<T = D1Result>(statements: D1PreparedStatement[]): Promise<T[]>;
    exec<T = D1Result>(query: string): Promise<T>;
  }
  
  declare global {
    interface Env {
      DB: D1Database;
    }
  }
  
  export {};