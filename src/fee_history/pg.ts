import { Client, QueryArrayConfig, QueryResult } from "pg";
import { PgStore } from "../pg_store";
import { FeeHistory } from "./interface";
import * as dotenv from "dotenv";
dotenv.config();

export class FeeHistoryStore {
  private tableName = "fee_history";

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

    const tableExists = checkTableExist.rows[0].exists;

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

    const csvFilePath = process.env.FEE_HISTORY_FILE_PATH;
    await PgStore.copyCsvDataToTable(csvFilePath, this.tableName).catch((
      error,
    ) => console.error("Error:", error));
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
    ORDER BY time DESC
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
