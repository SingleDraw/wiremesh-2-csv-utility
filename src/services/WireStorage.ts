
class WireStorage {
    wire_table: { [key: number]: any };
    query = 'SELECT * FROM wiretable';

    constructor() {
        this.wire_table = {};
    }

    addWire(wire: any) {
        this.wire_table[wire.wire_diameter] = {
            wire_diameter: wire.wire_diameter,
            is_standard: !!wire.standard_check,
            is_stainless: !!wire.stainless_check,
            is_piano: !!wire.piano_check
        }
    }

    get wires() {
        // console.log(this.wire_table);
        return this.wire_table;
    }
}

export default WireStorage;