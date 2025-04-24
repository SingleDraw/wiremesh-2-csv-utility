import { WireStorage, wireResult } from '../../services/WireStorage';
import OpeningsStorage from '../../services/OpeningsStorage';
import { queryCallback, MysqlError, Connection } from 'mysql';

export default class OpeningManager {
    private openings_storage: OpeningsStorage;
    constructor(
        private connection : Connection,
        private wire_storage: WireStorage = new WireStorage(),
    ) {
        this.openings_storage = new OpeningsStorage(this.wire_storage);
    }

    connectAsync = (): Promise<void> => 
        new Promise((resolve, reject) => {
            this.connection.connect(err => {
            if (err) return reject(err);
            console.log('Connection established');
            resolve();
          });
        });

    queryAsync = (
        sql: string, 
        callback: queryCallback
    ): Promise<void> => 
        new Promise((resolve, reject) => {
            this.connection.query(
                sql, 
                (
                    err: MysqlError | null, 
                    rows: Record<string, unknown>[]
                ) => {
                    if (err) return reject(err);
                    callback(err, rows);
                    resolve();
                }
            );
        });
    
    async main() {
        try {
            // 1: Connect to the database
            await this.connectAsync();
        
            // 2: Populate wire_storage
            await this.queryAsync(
                this.wire_storage.query, 
                (err, rows: wireResult[]) => {
                    rows.forEach(wire => this.wire_storage.addWire(wire));
                }
            );
        
            // 3: Query opening tables (can be parallel)
            await Promise.all([
                this.queryAsync(this.openings_storage.queryFn(1), this.openings_storage.get_woven_openings()),
                this.queryAsync(this.openings_storage.queryFn(7), this.openings_storage.get_flattop_openings()),
                this.queryAsync(this.openings_storage.queryFn(5), this.openings_storage.get_straightHarp_openings()),
                this.queryAsync(this.openings_storage.queryFn(6), this.openings_storage.get_harp_openings()),
                this.queryAsync(this.openings_storage.queryFn(3), this.openings_storage.get_welded_openings()),
                this.queryAsync(this.openings_storage.queryFn(4), this.openings_storage.get_piano_openings())
            ]);
      
            // 4: End connection
            this.connection.end((err: unknown) => {
                if (err) {
                console.log('Error ending the connection');
                return;
                }
                console.log('Connection ended');
            });
    
        } catch (err) {
            console.error('Error during DB operations:', err);
            this.connection.end(); 
        }
    }
}
