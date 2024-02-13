import { PgStore } from "../pg_store";
import { MovingAverage } from "./interface";

export class MovingAverageStore {
  
  private tableName = "movingAverage";

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

    const tableExists = checkTableExist.rows[0].EXISTS;

    if (tableExists) {
      return;
    }

    console.log(`Table ${this.tableName} not found. Creating...`);
    const query = `
          CREATE TABLE IF NOT EXISTS ${this.tableName} (
            yearly NUMERIC,
            monthly NUMERIC,
            createdAt TIMESTAMP WITH TIME ZONE  
            );
        `;
    const res = await PgStore.execQuery(query);

    if (res instanceof Error) {
      throw res;
    }
  }

  async read(): Promise<MovingAverage | Error> {
    const query = `
    SELECT yearly, monthly
    FROM ${this.tableName};
`;
    const result = await PgStore.execQuery(query);

    if (result instanceof Error) {
      throw result;
    }

    const movingAverage: MovingAverage = {
      createdAt: new Date().toUTCString(),
      yearly: result.rows[0].yearly,
      monthly: result.rows[0].monthly,
    };

    return movingAverage;
  }

  async update(rowData: MovingAverage): Promise<boolean | Error> {
    const query = `
    UPDATE ${this.tableName}
    SET yearly = $1,
        monthly = $2;
`;
    const result = await PgStore.execQuery(query, [
      rowData.yearly,
      rowData.monthly,
    ]);
    if (result instanceof Error) {
      throw result;
    }
    return true;
  }
}
