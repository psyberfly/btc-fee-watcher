import { FeeOp } from "../fee_estimate/fee_estimate";
import { FeeEstimate } from "../fee_estimate/interface";
import { IIndexWatcher, FeeEstMovingAverage, Index } from "./interface";
import { IndexStore } from "./pg";

export class IndexerWatcher implements IIndexWatcher {
  private feeOp = new FeeOp();
  private store = new IndexStore();

  readLatest(): Promise<Error | FeeEstMovingAverage> {
    const res = this.store.read();
    return res;
  }
  async updateFeeEstMovingAverages(): Promise<boolean | Error> {
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
        createdAt: new Date().toUTCString(),
        last365Days: yearlyAverage,
        last30Days: monthlyAverage,
      };

      this.store.update(update);
    } catch (e) {
      throw e;
    }
  }

  async udpateIndex(currentFeeEst: FeeEstimate): Promise<Index | Error> {
    //fetch curent btc fee from db?
    const currentFeeRate = currentFee.satsPerByte;

    const today = new Date().toUTCString;

    const movingAvgToday = await this.store.readMovingAvgByDate(today);

    if (movingAvgToday instanceof Error) {
      throw movingAvgToday;
    }

    const ratioFeeToYearlyAvg = currentFeeRate / movingAvgToday.last365Days;

    const ratioFeeToMonthlyAvg = currentFeeRate / movingAvgToday.last30Days;

    const feeAvgRatio: CurrAvgFeeEstRatio = {
      
      fee: currentFee,
      movingAverage: movingAvgToday,
      currToAvgYrlyRatio: ratioFeeToYearlyAvg,
      currToAvgMnthlyRatio: ratioFeeToMonthlyAvg,
    };

    this.store.updateFeeAvgRatio(feeRatio);
  }
}
