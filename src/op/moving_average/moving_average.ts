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

  async checkExists(dateUTC: string): Promise<boolean | Error> {
    const exists = await this.store.checkRowExistsByDate(dateUTC);

    if (exists instanceof Error) {
      return handleError(exists);
    }

    return exists;
  }

  async create(): Promise<boolean | Error> {
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

      console.log({ yearlyAverage });

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
        createdAt: null, //Added by DB
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
