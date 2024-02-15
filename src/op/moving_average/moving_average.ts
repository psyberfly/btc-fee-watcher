import { query } from "express";
import { PgStore } from "../../infra/db";
import { FeeEstMovingAverage, IMovingAverageOp } from "./interface";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { MovingAverageStore } from "./store/pg";
import { handleError } from "../../lib/errors/e";

export class MovingAverageOp implements IMovingAverageOp {
  private feeOp = new FeeOp();
  private store = new MovingAverageStore();

  async readLatest(): Promise<Error | FeeEstMovingAverage> {
    const latestMovingAvg = await this.store.readLatest();
    if (latestMovingAvg instanceof Error) {
      return handleError(latestMovingAvg);
    }
    return latestMovingAvg;
  }

  async update(): Promise<boolean | Error> {
    try {
      const feeHistoryLastYear = await this.feeOp.readLast365Days();

      if (feeHistoryLastYear instanceof Error) {
        return feeHistoryLastYear;
      }
      if (feeHistoryLastYear.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }

      const yearlySum = feeHistoryLastYear.reduce(
        (acc, curr) => acc + curr.satsPerByte.valueOf(),
        0,
      );

      const yearlyAverage = yearlySum / feeHistoryLastYear.length;

      const feeHistoryLastMonth = await this.feeOp.readLast30Days();

      if (feeHistoryLastMonth instanceof Error) {
        return feeHistoryLastMonth;
      }
      if (feeHistoryLastMonth.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }

      const monthlySum = feeHistoryLastMonth.reduce(
        (acc, curr) => acc + curr.satsPerByte.valueOf(),
        0,
      );

      const monthlyAverage = monthlySum / feeHistoryLastYear.length;

      const update: FeeEstMovingAverage = {
        id: null, //Added by DB
        createdAt: new Date().toUTCString(),
        last365Days: yearlyAverage,
        last30Days: monthlyAverage,
      };

      this.store.insert(update);
      return true;
    } catch (e) {
      return handleError(e);
    }
  }
}
