import { Client, QueryResult } from "pg";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

export class PgStore {
  public static async execQuery(
    query: string,
    values?: any[],
  ): Promise<QueryResult<any> | Error> {
    try {
      const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });

      await client.connect();
      const res = await client.query(query, values);
      await client.end();
      return res;
    } catch (e) {
      return e;
    }
  }

  public async copyCsvDataToTable(
    filePath: string,
    tableName: string,
  ): Promise<void> {
    try {
      // Read the CSV file
      const csvData = fs.readFileSync(filePath, "utf8");

      // Copy data from the CSV file into the PostgreSQL table
      await PgStore.execQuery(
        `
        COPY ${tableName} FROM STDIN WITH CSV HEADER;
      `,
        [csvData],
      );

      console.log(`CSV data copied into table ${tableName} successfully.`);
    } catch (error) {
      console.error("Error copying CSV data to table:", error);
    }
  }
}
