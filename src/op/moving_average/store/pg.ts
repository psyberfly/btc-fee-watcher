import { PgStore } from "../../../infra/db";
import { handleError } from "../../../lib/errors/e";
import { FeeEstMovingAverage } from "../interface";

export class MovingAverageStore {
  private tableName = "moving_average";

  async initTable(): Promise<void> {
    const query = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                  id SERIAL PRIMARY KEY,
                  last365Days NUMERIC,
                  last30Days NUMERIC,
                  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
                  );
              `;
    const res = await PgStore.execQuery(query);

    if (res instanceof Error) {
      throw res;
    }
  }

  async readLatest(): Promise<FeeEstMovingAverage | Error> {
    const query = `
        SELECT *
        FROM ${this.tableName};
    `;
    const result = await PgStore.execQuery(query);

    if (result instanceof Error) {
      return handleError(result);
    }

    const movingAverage: FeeEstMovingAverage = {
      id: result.rows[0]["id"],
      createdAt: result.rows[0]["createdAt"],
      last365Days: result.rows[0]["last365Days"],
      last30Days: result.rows[0]["monthly"],
    };

    return movingAverage;
  }

  async insert(movingAverage: FeeEstMovingAverage): Promise<boolean | Error> {
    const query = `
       INSERT INTO ${this.tableName} (last365Days, last30Days) 
       VALUES (${movingAverage.last365Days}, ${movingAverage.last30Days});

    `;
    const result = await PgStore.execQuery(query);

    if (result instanceof Error) {
      return handleError(result);
    }

    return true;
  }
}
