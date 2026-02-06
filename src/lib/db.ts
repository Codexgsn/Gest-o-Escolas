
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is not set');
}

const pool = new Pool({ connectionString });

export default pool;
