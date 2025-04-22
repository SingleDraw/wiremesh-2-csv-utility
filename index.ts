import { connection } from './src/db';
import { WireStorage, wireResult } from './src/services/WireStorage';
import OpeningsStorage from './src/services/OpeningsStorage';
import { queryCallback, MysqlError } from 'mysql';

/* GLOBAL VARIABLES */
const wire_storage = new WireStorage();
const openings_storage = new OpeningsStorage(wire_storage);


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
    callback: queryCallback
): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.query(
        sql, 
        (err: MysqlError | null, rows: Record<string, unknown>[]) => {
            if (err) return reject(err);
            callback(err, rows);
            resolve();
        }
      );
    });
  }

async function main() {
    try {
        // 1: Connect to the database
        await connectAsync();
    
        // 2: Populate wire_storage
        await queryAsync(wire_storage.query, (err, rows: wireResult[]) => {
            rows.forEach(wire => wire_storage.addWire(wire));
        });
    
        // 3: Query opening tables (can be parallel)
        await Promise.all([
            queryAsync(openings_storage.queryFn(1), openings_storage.get_woven_openings()),
            queryAsync(openings_storage.queryFn(7), openings_storage.get_flattop_openings()),
            queryAsync(openings_storage.queryFn(5), openings_storage.get_straightHarp_openings()),
            queryAsync(openings_storage.queryFn(6), openings_storage.get_harp_openings()),
            queryAsync(openings_storage.queryFn(3), openings_storage.get_welded_openings()),
            queryAsync(openings_storage.queryFn(4), openings_storage.get_piano_openings())
        ]);
  
        // 4: End connection
        connection.end((err: unknown) => {
            if (err) {
            console.log('Error ending the connection');
            return;
            }
            console.log('Connection ended');
        });

    } catch (err) {
        console.error('Error during DB operations:', err);
        connection.end(); 
    }
}
  

main();


