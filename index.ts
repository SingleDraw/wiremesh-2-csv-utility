import { connection, connectToDatabase } from './src/db';

import WireStorage from './src/services/WireStorage';
import OpeningsStorage from './src/services/OpeningsStorage';

connection.connect((err: unknown) => {
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});


/* GLOBAL WIRETABLE */
const wire_storage = new WireStorage();
const openings_storage = new OpeningsStorage(wire_storage);


/* QUERYING WIRETABLE */
connection.query(wire_storage.query, (err: unknown, rows: any[]) => {
    if(err) throw err;
    rows.forEach(wire => {
        wire_storage.addWire(wire);
    });
  }
);


/* QUERYING OPENINGTABLE FOR WOVEN WIRE MESHES */
connection.query(
    openings_storage.queryFn(1), // screentype = 1
    openings_storage.get_woven_openings() // bind the context of this to the function
);

/* QUERYING OPENINGTABLE FOR FLAT-TOP MESHES */
connection.query(
    openings_storage.queryFn(7), // screentype = 1
    openings_storage.get_flattop_openings() // bind the context of this to the function
);


connection.end((err: unknown) => {
    if(err){
        console.log('Error ending the connection');
        return;
    }
    console.log('Connection ended');
});


