# Mesh Data Exporter

A small Node.js + TypeScript script for exporting wire mesh and opening data from a MySQL database into CSV files. It’s used to assist in managing various wire types and mesh specifications for quarry and industrial applications.

This tool outputs categorized .csv files based on mesh type and material (e.g. standard, stainless steel), pulled from an internal database.

It’s part of the data pipeline for MeshBuilder3D v2.0 — a mesh modeling and configuration system used in wire mesh production — and helps transform backend data into formats ready for processing, visualization, or integration.

## Project Structure

```
├── src
│   ├── services
│   │   ├── CsvBuilder.ts           # Handles CSV formatting and saving
│   │   ├── OpeningsStorage.ts      # Fetches mesh opening data
│   │   └── WireStorage.ts          # Fetches wire type data
│   └── db.ts                       # MySQL connection setup
├── tables                          # Output directory for all CSV files
├── index.ts                        # Entry point
```

## Mesh Types Included

- Woven Wire Meshes
- Welded Wire Meshes
- Harp / Straight Harp Wire Meshes
- Piano Wire Meshes
- Flattop Wire Meshes

Each type includes data for both **standard** and **stainless** wire variants, along with corresponding mesh opening specs.

## Usage

This script is tailored for a specific database schema and isn’t meant as a general-purpose tool.

If you're reviewing this repo:

- It requires a `.env` file with valid MySQL credentials.
- Run using:

```bash
npx ts-node index.ts
```

Outputs will be saved under `tables/` as structured CSV files.

## Notes

- MySQL driver used: [`mysql`](https://www.npmjs.com/package/mysql)

## License

MIT

