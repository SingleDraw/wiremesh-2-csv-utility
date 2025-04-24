import { WireStorage, wireResult } from '../../services/WireStorage';
import OpeningsStorage from '../../services/OpeningsStorage';
import { queryCallback, MysqlError, PoolConnection } from 'mysql';
import { pool } from '../../db';

export default class OpeningManager {
    private openings_storage: OpeningsStorage;
    private connection: PoolConnection | null = null;
    constructor(
        private wire_storage: WireStorage = new WireStorage(),
    ) {
        this.openings_storage = new OpeningsStorage(this.wire_storage);
    }

    queryAsync = (
        sql: string, 
        callback: queryCallback
    ): Promise<void> => 
        new Promise((resolve, reject) => {
            if (!this.connection) {
                return reject(new Error('No connection available'));
            }
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

        this.connection = await new Promise((resolve, reject) =>
            pool.getConnection((err, conn) => (err ? reject(err) : resolve(conn)))
          );

        try {
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
    
        } catch (err) {
            console.error('Error during DB operations:', err);
        } finally {
            if (this.connection) {
                this.connection.release();
            }
        }
    }
}
