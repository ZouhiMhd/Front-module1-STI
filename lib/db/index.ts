import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Determine if we're in production (Render) or development
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.DATABASE_URL?.includes('render.com');

// Create a connection pool with SSL support for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL configuration for Render (required for external connections)
  ssl: (isProduction || isRender) ? {
    rejectUnauthorized: false, // Required for Render's self-signed certificates
  } : false,
  max: 10, // Maximum number of connections in the pool
});

// Create the Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct queries if needed
export { pool };

// Helper to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
