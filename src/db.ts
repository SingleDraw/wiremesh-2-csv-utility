import { createConnection, MysqlError } from 'mysql';
import { join } from 'path';
import { config as dotenv } from 'dotenv';

// Load .env file relative to this module
dotenv({ path: join(__dirname, '..', '.env') });

/**
 * Database connection
 * @type {mysql.Connection}
 */

const connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

/**
 * Connect to the MySQL database
 * @returns {Promise<mysql.Connection>} - A promise that resolves to the MySQL connection object.
 */
function connectToDatabase() {
    return new Promise((resolve, reject) => {
      connection.connect((err: MysqlError | null) => {
        if (err) {
          console.error('❌ Error connecting to DB:', err.message);
          reject(err);
        } else {
          console.log('✅ MySQL connection established');
          resolve(connection);
        }
      });
    });
  }
  
export {
    connection,
    connectToDatabase,
};