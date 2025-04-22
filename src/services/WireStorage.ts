
export type wireResult = {
    wire_diameter: number;
    standard_check: number;
    stainless_check: number;
    piano_check: number;
};

export class WireStorage {
    wire_table: Record<number,{
        wire_diameter: number;
        is_standard: boolean;
        is_stainless: boolean;
        is_piano: boolean;
    }>;
    query = 'SELECT * FROM wiretable';

    constructor() {
        this.wire_table = {};
    }

    addWire(wire: wireResult) {
        this.wire_table[wire.wire_diameter] = {
            wire_diameter: wire.wire_diameter,
            is_standard: !!wire.standard_check,
            is_stainless: !!wire.stainless_check,
            is_piano: !!wire.piano_check
        }
    }

    get wires() {
        return this.wire_table;
    }
}
