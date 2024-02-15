import { PgStore } from "../../../infra/db";
import { handleError } from "../../../lib/errors/e";
import { FeeEstimate } from "../../fee_estimate/interface";
import { FeeEstMovingAverage } from "../../moving_average/interface";
import { Index } from "../interface";

export class IndexStore {
  private tableName = "fee_index";
  private tableNameFeeEst = "fee_estimate";
  private tableNameMovingAverage = "moving_average";

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

    const query = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                  id SERIAL PRIMARY KEY,
                  fee_estimate_id SERIAL REFERENCES fee_estimate(id),
                  moving_average_id SERIAL REFERENCES moving_average(id),
                  ratio_last_365_days NUMERIC,
                  ratio_last_30_days NUMERIC,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
                  );
              `;
    const res = await PgStore.execQuery(query);

    if (res instanceof Error) {
      handleError(res);
    }
  }

  async readLatest(): Promise<Index | Error> {
    try {
      //moving avg and index tables both have createdAt and id. Update query to disambiguate the two!!
      const query = `
    SELECT ${this.tableName}.*, ${this.tableNameFeeEst}.*, ${this.tableNameMovingAverage}.*
    FROM ${this.tableName}
    INNER JOIN ${this.tableNameFeeEst} ON ${this.tableName}.fee_estimate_id = ${this.tableNameFeeEst}.id
    INNER JOIN ${this.tableNameMovingAverage} ON ${this.tableName}.moving_average_id = ${this.tableNameMovingAverage}.id
    WHERE ${this.tableName}.id = (
        SELECT id
        FROM ${this.tableName}
        ORDER BY created_at DESC
        LIMIT 1
    );
    
    `;
      const result = await PgStore.execQuery(query);

      if (result instanceof Error) {
        return handleError(result);
      }

      const feeEst: FeeEstimate = {
        id: result[0]["id"],
        time: result[0]["time"],
        satsPerByte: result[0]["sats_per_byte"],
      };

      const movingAverage: FeeEstMovingAverage = {
        id: result[0]["id"],
        createdAt: result[0]["created_at"],
        last365Days: result[0]["last_365_days"],
        last30Days: result[0]["last_30_days"],
      };

      const index: Index = {
        feeEstimate: feeEst,
        movingAverage: movingAverage,
        ratioLast365Days: result[0]["ratio_last_365_days"],
        ratioLast30Days: result[0]["ratio_last_30_days"],
        createdAt: result[0]["created_at"],
      };

      return index;
    } catch (e) {
      return handleError(e);
    }
  }

  async insert(index: Index): Promise<boolean | Error> {
    const query = `
       INSERT INTO ${this.tableName} (fee_estimate_id, moving_average_id, ratio_last_365_days, ratio_last_30_days) 
       VALUES (${index.feeEstimate.id}, ${index.movingAverage.id}, ${index.ratioLast365Days},${index.ratioLast30Days});

    `;
    const result = await PgStore.execQuery(query);

    if (result instanceof Error) {
      return handleError(result);
    }

    return true;
  }
}
