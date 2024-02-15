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
    const query = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                  id SERIAL PRIMARY KEY,
                  feeEstimateId NUMERIC REFERENCES fee_estimate(id),
                  movingAverageId NUMERIC REFERENCES moving_average(id),
                  ratioLast365Days NUMERIC
                  ratioLast30Days NUMERIC
                  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
                  );
              `;
    const res = await PgStore.execQuery(query);

    if (res instanceof Error) {
      throw res;
    }
  }

  async readLatest(): Promise<Index | Error> {
    //moving avg and index tables both have createdAt and id. Update query to disambiguate the two!!
    const query = `
    SELECT ${this.tableName}.*, ${this.tableNameFeeEst}.*, ${this.tableNameMovingAverage}.*
    FROM ${this.tableName}
    INNER JOIN ${this.tableNameFeeEst} ON ${this.tableName}.feeEstimateId = ${this.tableNameFeeEst}.id
    INNER JOIN ${this.tableNameMovingAverage} ON ${this.tableName}.movingAverageId = ${this.tableNameMovingAverage}.id
    WHERE ${this.tableName}.id = (
        SELECT id
        FROM ${this.tableName}
        ORDER BY createdAt DESC
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
      satsPerByte: result[0]["satsPerByte"],
    };

    const movingAverage: FeeEstMovingAverage = {
      id: result[0]["id"],
      createdAt: result[0]["createdAt"],
      last365Days: result[0]["last365Days"],
      last30Days: result[0]["last30Days"],
    };

    const index: Index = {
      feeEstimate: feeEst,
      movingAverage: movingAverage,
      ratioLast365Days: result[0]["ratioLast365Days"],
      ratioLast30Days: result[0]["ratioLast30Days"],
      createdAt: result[0]["createdAt"],
    };

    return index;
  }

  async insert(index: Index): Promise<boolean | Error> {
    const query = `
       INSERT INTO ${this.tableName} (feeEstimateId, movingAverageId, ratioLast365Days, ratioLast30Days) 
       VALUES (${index.feeEstimate.id}, ${index.movingAverage.id}, ${index.ratioLast365Days},${index.ratioLast30Days});

    `;
    const result = await PgStore.execQuery(query);

    if (result instanceof Error) {
      return handleError(result);
    }

    return true;
  }
}
