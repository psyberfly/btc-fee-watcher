import { Client, QueryArrayConfig, QueryResult } from "pg";
import { PgStore } from "../pg_store";
import { FeeHistory } from "./interface";

export class FeeHistoryStore {
  private tableName = "feeHistory";

  async initTable(): Promise<void> {
    const checkTableExistsQuery = `
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = '${this.tableName}'
    );
`;

    const checkTableExist = await PgStore.execQuery(checkTableExistsQuery);

    if (checkTableExist instanceof Error) {
      throw checkTableExist;
    }

    const tableExists = checkTableExist.rows[0].EXISTS > 0;

    if (tableExists) {
      return;
    }

    console.log(`Table ${this.tableName} not found. Creating...`);

    const createQuery = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          time TIMESTAMP WITH TIME ZONE,
          sats_per_byte NUMERIC
        );
      `;

    const res = await PgStore.execQuery(createQuery);

    if (res instanceof Error) {
      throw res;
    }

    //load data:

    // const csvFilePath =
    //   "/home/anorak/Documents/btc-fee-estimate-api-specific-23-02-13-to-24-02-13-1-to-2-blocks.csv";

    // await this.store.copyCsvDataToTable(csvFilePath, this.tableName).catch((
    //   error,
    // ) => console.error("Error:", error));
  }

  async create(rowData: FeeHistory): Promise<boolean | Error> {
    const query =
      `INSERT INTO ${this.tableName} (time, statsPerByte) VALUES ($1, $2)`;
    const result = await PgStore.execQuery(query, [
      rowData.time,
      rowData.satsPerByte,
    ]);
    if (result instanceof Error) {
      throw result;
    }
    return true;
  }

  async readByRange(
    fromDate: String,
    toDate: String,
  ): Promise<FeeHistory[] | Error> {
    const query =
      `SELECT * FROM ${this.tableName} WHERE time >= $1 AND time <= $2`;
    const result = await PgStore.execQuery(query, [fromDate, toDate]);
    if (result instanceof Error) {
      throw result;
    }
    const feeHistory: FeeHistory[] = result.rows.map((row: any) => ({
      time: row.time,
      satsPerByte: row.sats_per_byte,
    }));
    return feeHistory;
  }

  async readLatest(): Promise<FeeHistory | Error> {
    const query = `
    SELECT *
    FROM fee_history
    ORDER BY datetime DESC
    LIMIT 1;
`;
    const result = await PgStore.execQuery(query);
    if (result instanceof Error) {
      throw result;
    }
    const feeHistory: FeeHistory = result.rows[0];
    return feeHistory;
  }
}
