import { createPool } from 'mysql';
import { join } from 'path';
import { config as dotenv } from 'dotenv';

// Load .env file relative to this module
dotenv({ path: join(__dirname, '..', '.env') });

/**
 * * MySQL connection pool
 * * @module db
 * * @requires mysql
 */
export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10 // Adjust the limit as needed
});
