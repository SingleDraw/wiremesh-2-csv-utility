import { WireStorage } from './WireStorage';
import CsvBuilder from './CsvBuilder';
import { queryCallback } from 'mysql';

type queryResult = {
    opening: number;
    fi_min: number | null;
    fi_max: number | null;
    fi_std: number;
    fi_set: string | null;
};

class OpeningsStorage {
    queryFn = ( screentype: number ) => 
        `SELECT * FROM openingtable WHERE screentype = '${screentype}'`;

    private csv_paths = {
        // parse woven result
        woven: 'tables/wovenWireMeshes/woven',
        flattop: 'tables/flattopWireMeshes/flattop',
        straightHarp: 'tables/straightHarpWireMeshes/straightHarp',
        harp: 'tables/harpWireMeshes/harp',
        // parse inrange result
        welded: 'tables/weldedWireMeshes/welded',
        piano: 'tables/pianoWireMeshes/piano',
    };
    
    constructor( private wire_storage: WireStorage ) {}

    get_woven_openings = (): queryCallback => this.get_openings(this.csv_paths.woven)

    get_flattop_openings = (): queryCallback => this.get_openings(this.csv_paths.flattop)

    get_straightHarp_openings = (): queryCallback => this.get_openings(this.csv_paths.straightHarp)

    get_harp_openings = (): queryCallback => this.get_openings(this.csv_paths.harp)

    get_welded_openings = (): queryCallback => this.get_openings(this.csv_paths.welded, 'welded')

    get_piano_openings = (): queryCallback => this.get_openings(this.csv_paths.piano, 'piano')

    /**
     * MESHES OPENINGS
     * @param error 
     * @param queryResult 
     */
    get_openings = (
        filePath: string,
        type: string = 'woven'
    ): queryCallback => (
        error: unknown, 
        queryResult: queryResult[]
    ): void => {
        if (error) throw error;

        const {
            openings_array,
            wire_std,
            wire_stn
        } = type === 'welded' 
                ? this._parse_inrange_result(queryResult)
                : type === 'piano' 
                ? this._parse_inrange_result(queryResult, true) 
                : this._parse_woven_result(queryResult);

        /** CSV BUILD   */
        const csvOpenings = new CsvBuilder(
            ['opening[mm]', 'wire dia[mm] std', 'wire dia[mm] stn', 'fi_std'],
            ';', `${filePath}wire_meshes_openings_table.csv`
        );
        for (const [key, standard, stainless, std] of openings_array) {
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
        for (const [key, openings] of Object.entries(wire_std)) {
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
        for (const [key, openings] of Object.entries(wire_stn)) {
            csvWiresStainless.addRow([
                key.toString(),
                openings.join(', ')
            ]);
        }
        csvWiresStainless.save();
    }

    _parse_inrange_result = (
        queryResult: queryResult[],
        is_piano: boolean = false
    ) => {
        const openings_array: [number, number[], number[], number][] = [];
        const wire_std: { [key: number]: number[] } = {};
        const wire_stn: { [key: number]: number[] } = {};

        const wire_table = this.wire_storage.wires;

        queryResult.forEach((row) => {
            if (row.fi_min !== null && row.fi_max !== null) {
                const row_fi_set: number[] = Object.keys(wire_table).filter((fi) => {
                    const wire_diameter = parseFloat(fi);
                    return (
                        row.fi_min !== null && wire_diameter >= row.fi_min &&
                        row.fi_max !== null && wire_diameter <= row.fi_max
                    );
                }).map(Number);

                // by opening
                openings_array.push([
                    row.opening,
                    row_fi_set.filter((fi: number) => is_piano 
                        ? wire_table[fi].is_piano == true 
                        : wire_table[fi].is_standard == true
                    ),
                    row_fi_set.filter((fi: number) => wire_table[fi].is_stainless == true),
                    row.fi_std,
                ]);

                // by wire diameter
                row_fi_set.forEach((fi) => {
                    if (is_piano 
                        ? wire_table[fi].is_piano == true 
                        : wire_table[fi].is_standard == true
                    ) {
                        if (wire_std[fi] === undefined) {
                            wire_std[fi] = [row.opening];
                        } else {
                            wire_std[fi].push(row.opening);
                            wire_std[fi] = [...new Set(wire_std[fi])];
                        }
                    }
                    if (wire_table[fi].is_stainless == true) {
                        if (wire_stn[fi] === undefined) {
                            wire_stn[fi] = [row.opening];
                        } else {
                            wire_stn[fi].push(row.opening);
                            wire_stn[fi] = [...new Set(wire_stn[fi])];
                        }
                    }
                });
            }
        });

        /* SORTING BY OPENINGS */
        openings_array.sort((a, b) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });

        return { 
            openings_array, 
            wire_std, 
            wire_stn 
        };
    }

    _parse_woven_result = (queryResult: queryResult[]) => {
        const openings_array: [number, number[], number[], number][] = [];
        const wire_std: { [key: number]: number[] } = {};
        const wire_stn: { [key: number]: number[] } = {};

        const wire_table = this.wire_storage.wires;

        queryResult.forEach((row) => {
            if (row.fi_set != null && row.fi_set !== "" ) {
                const row_fi_set: number[] = row.fi_set.split("x").map(Number);

                // by opening
                openings_array.push([
                    row.opening,
                    row_fi_set.filter((fi: number) => wire_table[fi].is_standard == true),
                    row_fi_set.filter((fi: number) => wire_table[fi].is_stainless == true),
                    row.fi_std,
                ]);

                // by wire diameter
                row_fi_set.forEach((fi) => {
                    if (wire_table[fi].is_standard == true) {
                        if (wire_std[fi] === undefined) {
                            wire_std[fi] = [row.opening];
                        } else {
                            wire_std[fi].push(row.opening);
                            wire_std[fi] = [...new Set(wire_std[fi])];
                        }
                    }
                    if (wire_table[fi].is_stainless == true) {
                        if (wire_stn[fi] === undefined) {
                            wire_stn[fi] = [row.opening];
                        } else {
                            wire_stn[fi].push(row.opening);
                            wire_stn[fi] = [...new Set(wire_stn[fi])];
                        }
                    }
                });
            }
        });

        /* SORTING BY OPENINGS */
        openings_array.sort((a, b) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });

        return { 
            openings_array, 
            wire_std, 
            wire_stn 
        };
    }


}

export default OpeningsStorage;