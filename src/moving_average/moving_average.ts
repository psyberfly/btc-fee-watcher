import { FeeHistoryService } from "../fee_history/fee_history";
import { IMovingAverage, MovingAverage } from "./interface";
import { MovingAverageStore } from "./pg";

export class MovingAverageService implements IMovingAverage {
  private feeHistorySerivce = new FeeHistoryService();
  private store = new MovingAverageStore();

  get(): Promise<Error | MovingAverage> {
    const res = this.store.read();
    return res;
  }
  async update(): Promise<boolean | Error> {
    try {
      const feeHistoryLastYear = await this.feeHistorySerivce.getLastYear();

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

      const feeHistoryLastMonth = await this.feeHistorySerivce.getLastMonth();

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

      const update: MovingAverage = {
        createdAt: new Date().toUTCString(),
        yearly: yearlyAverage,
        monthly: monthlyAverage,
      };

      this.store.update(update);
    } catch (e) {
      throw e;
    }
  }
}
