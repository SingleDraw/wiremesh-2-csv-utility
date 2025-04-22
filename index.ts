import { connection, connectToDatabase } from './src/db';
import path from 'path';
import fs from 'fs';

import WireStorage from './src/services/WireStorage';
import OpeningsStorage from './src/services/OpeningsStorage';

connection.connect((err: unknown) => {
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});
interface WireTable {
    [key: number]: {
        is_standard: boolean;
        is_stainless: boolean;
    };
}
let wire_table: WireTable = {};

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



connection.query(openings_storage.queryFn(1), // screentype = 1
    (err: unknown, rows: any[]) => {
    if(err) throw err;
    // console.log(rows);

    const woven_array: [number, number[], number[], number][] = [];
    const woven_wire_std: { [key: number]: number[] } = {};
    const woven_wire_stn: { [key: number]: number[] } = {};
    const csvLines = [];
    const csvLinesWireStd = [];
    const csvLinesWireStn = [];

    wire_table = wire_storage.wires;

    /* QUERYING OPENINGTABLE */
    rows.forEach(row => {
        if(row.fi_set !== null && row.fi_set !== '') {
            const row_fi_set: number[] = row.fi_set.split('x').map(Number);

            // by opening
            woven_array.push([
                parseFloat(row.opening), 
                row_fi_set.filter((fi: number) => wire_table[fi].is_standard == true), 
                row_fi_set.filter((fi: number) => wire_table[fi].is_stainless == true), 
                row.fi_std
            ]);

            // by wire diameter
            row_fi_set.forEach((fi) => {
                if (wire_table[fi].is_standard == true) {
                    if (woven_wire_std[fi] === undefined) {
                        woven_wire_std[fi] = [parseFloat(row.opening)];
                    } else {
                        woven_wire_std[fi].push(parseFloat(row.opening));
                        woven_wire_std[fi] = [...new Set(woven_wire_std[fi])];
                    }
                }
                if (wire_table[fi].is_stainless == true) {
                    if (woven_wire_stn[fi] === undefined) {
                        woven_wire_stn[fi] = [parseFloat(row.opening)];
                    } else {
                        woven_wire_stn[fi].push(parseFloat(row.opening));
                        woven_wire_stn[fi] = [...new Set(woven_wire_stn[fi])];
                    }
                }
            });
        }
    });

    /* SORTING BY OPENINGS */
    woven_array.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
    });

    /** CSV BUILD  */
    csvLines.push('opening[mm];wire dia[mm] std;wire dia[mm] stn;fi_std');
    for (const [key, standard, stainless, std] of woven_array) {
        csvLines.push(`${key};${standard.join(', ')};${stainless.join(', ')};${std}`);
    }
    
    /* CSV WRITE */
    const outputPath = path.join(__dirname, 'tables/woven_opening_table.csv');
    fs.writeFileSync(outputPath, csvLines.join('\n'));
    console.log(`CSV saved to ${outputPath}`);


    /* CSV BUILD WIRE DIAMETER */
    csvLinesWireStd.push('wire dia[mm] std;opening[mm];');
    for (const [key, openings] of Object.entries(woven_wire_std)) {
        csvLinesWireStd.push(`${key};${openings.join(', ')};`);
    }
    csvLinesWireStn.push('wire dia[mm] stn;opening[mm];');
    for (const [key, openings] of Object.entries(woven_wire_stn)) {
        csvLinesWireStn.push(`${key};${openings.join(', ')};`);
    }
    
    /* CSV WRITE */
    const outputPathWireStd = path.join(__dirname, 'tables/woven_wire_std.csv');
    fs.writeFileSync(outputPathWireStd, csvLinesWireStd.join('\n'));
    console.log(`CSV saved to ${outputPathWireStd}`);
    
    const outputPathWireStn = path.join(__dirname, 'tables/woven_wire_stn.csv');
    fs.writeFileSync(outputPathWireStn, csvLinesWireStn.join('\n'));
    console.log(`CSV saved to ${outputPathWireStn}`);

  });




connection.end((err: unknown) => {
    if(err){
        console.log('Error ending the connection');
        return;
    }
    console.log('Connection ended');
});


