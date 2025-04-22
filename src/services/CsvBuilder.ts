
import * as fs from "fs";
import * as path from "path";

class CsvBuilder {
  private rows: string[][] = [];

  constructor(
    private headers: string[] = [],
    private delimiter: string = ";",
    private savePath: string = "./tables/output.csv",
) {}

  addRow(row: string[]) {
    if (row.length !== this.headers.length) {
      throw new Error("Row length does not match header length.");
    }
    this.rows.push(row);
  }

  build = (): string => [this.headers, ...this.rows]
        .map(e => e.join(this.delimiter))
        .join("\n");
  
  save = (): void => {
    const csvContent = this.build();
    const filePath = path.join(process.cwd(), this.savePath);
    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        filePath, 
        csvContent, 
        { encoding: "utf8" }
    );
    console.log(`CSV file saved to ${this.savePath}`);
  }
}

export default CsvBuilder;