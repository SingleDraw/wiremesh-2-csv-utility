import { connection } from './src/db';
import WireStorage from './src/services/WireStorage';
import OpeningsStorage from './src/services/OpeningsStorage';

function connectAsync(): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.connect(err => {
      if (err) return reject(err);
      console.log('Connection established');
      resolve();
    });
  });
}

function queryAsync(
    sql: string, 
    callback: (err: any, rows: any[]) => void
): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        callback(err, rows);
        resolve();
      });
    });
  }

/* GLOBAL WIRETABLE */
const wire_storage = new WireStorage();
const openings_storage = new OpeningsStorage(wire_storage);


async function main() {
    try {
        // Step 1: Connect to the database
        await connectAsync();
    
        // Step 2: Populate wire_storage
        await queryAsync(wire_storage.query, (err, rows) => {
            rows.forEach(wire => wire_storage.addWire(wire));
        });
    
        // Step 3: Query opening tables (can be parallel)
        await Promise.all([
            queryAsync(openings_storage.queryFn(1), openings_storage.get_woven_openings()),
            queryAsync(openings_storage.queryFn(7), openings_storage.get_flattop_openings()),
            queryAsync(openings_storage.queryFn(5), openings_storage.get_straightHarp_openings()),
            queryAsync(openings_storage.queryFn(6), openings_storage.get_harp_openings()),
            queryAsync(openings_storage.queryFn(3), openings_storage.get_welded_openings()),
            queryAsync(openings_storage.queryFn(4), openings_storage.get_piano_openings())
        ]);
  
        // Step 4: End connection
        connection.end((err: unknown) => {
            if (err) {
            console.log('Error ending the connection');
            return;
            }
            console.log('Connection ended');
        });

    } catch (err) {
        console.error('Error during DB operations:', err);
        connection.end(); // Ensure cleanup even on failure
    }
}
  

// Execute the main function
main();


