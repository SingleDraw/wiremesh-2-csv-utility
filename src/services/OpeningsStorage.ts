 import WireStorage from './WireStorage.js';
/*
        PID: 34,
    screentype: 1,
    opening: 6.3,
    fi_min: 1.5,
    fi_max: 3,
    fi_set: '3',
    fi_std: 3,
    material: 'standard|stainless',
    note: null
    */

class OpeningsStorage {
    wire_storage: WireStorage;
    opening_table: { [key: number]: any };
    queryFn = (
        screentype: number
    ) => 
        `SELECT * FROM openingtable WHERE screentype = '${screentype}'`;
    
    constructor(wire_storage: WireStorage) {
        this.opening_table = {};
        this.wire_storage = wire_storage;

    }
}

export default OpeningsStorage;