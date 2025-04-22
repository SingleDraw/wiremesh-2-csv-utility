 import { error } from 'console';
import WireStorage from './WireStorage';
import CsvBuilder from './CsvBuilder';
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
    queryFn = ( screentype: number ) => 
        `SELECT * FROM openingtable WHERE screentype = '${screentype}'`;

    private csv_paths = {
        woven: 'tables/wovenWireMeshes/woven',
        flattop: 'tables/flattopWireMeshes/flattop',
    };
    
    constructor( private wire_storage: WireStorage ) {}

    get_woven_openings = () => this.get_openings(this.csv_paths.woven)

    get_flattop_openings = () => this.get_openings(this.csv_paths.flattop)

    /**
     * MESHES OPENINGS
     * @param error 
     * @param queryResult 
     */
    get_openings = (
        filePath: string,
    ) => (
        error: unknown, 
        queryResult: any[]
    ) => {
        if (error) throw error;

        const {
            woven_openings_array,
            woven_wire_std,
            woven_wire_stn
        } = this._parse_woven_result(queryResult);

        /** CSV BUILD   */
        const csvOpenings = new CsvBuilder(
            ['opening[mm]', 'wire dia[mm] std', 'wire dia[mm] stn', 'fi_std'],
            ';', `${filePath}wire_meshes_openings_table.csv`
        );
        for (const [key, standard, stainless, std] of woven_openings_array) {
            csvOpenings.addRow([
                key.toString(),
                standard.join(', '),
                stainless.join(', '),
                std.toString()
            ]);
        }
        csvOpenings.save();


        /** CSV BUILD WIRE DIAMETER */
        const csvWiresStandard = new CsvBuilder(
            ['wire dia[mm] std', 'opening[mm]'],
            ';', `${filePath}_wire_standard.csv`
        );
        for (const [key, openings] of Object.entries(woven_wire_std)) {
            csvWiresStandard.addRow([
                key.toString(),
                openings.join(', ')
            ]);
        }
        csvWiresStandard.save();


        const csvWiresStainless = new CsvBuilder(
            ['wire dia[mm] stn', 'opening[mm]'],
            ';', `${filePath}_wire_stainless.csv`
        );
        for (const [key, openings] of Object.entries(woven_wire_stn)) {
            csvWiresStainless.addRow([
                key.toString(),
                openings.join(', ')
            ]);
        }
        csvWiresStainless.save();
    }

    _parse_woven_result = (queryResult: any[]) => {
        const woven_openings_array: [number, number[], number[], number][] = [];
        const woven_wire_std: { [key: number]: number[] } = {};
        const woven_wire_stn: { [key: number]: number[] } = {};

        const wire_table = this.wire_storage.wires;

        queryResult.forEach((row) => {
            if (row.fi_set !== null && row.fi_set !== "") {
                const row_fi_set: number[] = row.fi_set.split("x").map(Number);

                // by opening
                woven_openings_array.push([
                    parseFloat(row.opening),
                    row_fi_set.filter((fi: number) => wire_table[fi].is_standard == true),
                    row_fi_set.filter((fi: number) => wire_table[fi].is_stainless == true),
                    row.fi_std,
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
        woven_openings_array.sort((a, b) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });

        return { 
            woven_openings_array, 
            woven_wire_std, 
            woven_wire_stn 
        };
    }


}

export default OpeningsStorage;