const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

const con = mysql.createConnection({
  host: "sql.sitastalowe.nazwa.pl",
  user: "sitastalowe_1",
  password: "5D8dfxc23D",
  database: "sitastalowe_1"
});

con.connect((err) => {
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
});


/* GLOBAL WIRETABLE */
wire_table = {}

/* QUERYING WIRETABLE */
con.query('SELECT * FROM wiretable', (err, rows) => {
    if(err) throw err;
    rows.forEach(row => {

        wire_table[row.wire_diameter] = {
            wire_diameter: row.wire_diameter,
            is_standard: !!row.standard_check,
            is_stainless: !!row.stainless_check,
            is_piano: !!row.piano_check
        };

        console.log(wire_table[row.wire_diameter]);
    });
  }
);

con.query('SELECT * FROM openingtable WHERE screentype = 7',
    (err, rows) => {
    if(err) throw err;
    // console.log(rows);
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

    woven_array = [];
    woven_wire_std = {};
    woven_wire_stn = {};
    csvLines = [];
    csvLinesWireStd = [];
    csvLinesWireStn = [];


    /* QUERYING OPENINGTABLE */
    rows.forEach(row => {
        if(row.fi_set !== null && row.fi_set !== '') {
            row_fi_set = row.fi_set.split('x').map(Number);

            // by opening
            woven_array.push([
                parseFloat(row.opening), 
                row_fi_set.filter((fi) => wire_table[fi].is_standard == true), 
                row_fi_set.filter((fi) => wire_table[fi].is_stainless == true), 
                row.fi_std
            ]);

            // by wire diameter
            row_fi_set.forEach((fi) => {
                if (wire_table[fi].is_standard == true) {
                    if (woven_wire_std[fi] === undefined) {
                        woven_wire_std[fi] = [row.opening];
                    } else {
                        woven_wire_std[fi].push(row.opening);
                        woven_wire_std[fi] = [...new Set(woven_wire_std[fi])];
                    }
                }
                if (wire_table[fi].is_stainless == true) {
                    if (woven_wire_stn[fi] === undefined) {
                        woven_wire_stn[fi] = [row.opening];
                    } else {
                        woven_wire_stn[fi].push(row.opening);
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
    const outputPath = path.join(__dirname, 'tables/flat_opening_table.csv');
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
    const outputPathWireStd = path.join(__dirname, 'tables/flat_wire_std.csv');
    fs.writeFileSync(outputPathWireStd, csvLinesWireStd.join('\n'));
    console.log(`CSV saved to ${outputPathWireStd}`);
    const outputPathWireStn = path.join(__dirname, 'tables/flat_wire_stn.csv');
    fs.writeFileSync(outputPathWireStn, csvLinesWireStn.join('\n'));
    console.log(`CSV saved to ${outputPathWireStn}`);

  });




con.end((err) => {
    if(err){
        console.log('Error ending the connection');
        return;
    }
    console.log('Connection ended');
});


