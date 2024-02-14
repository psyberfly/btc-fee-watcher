import { FeeHistoryService } from "../../op/fee_history/fee_history";
import { MovingAverageService } from "../../op/moving_average/moving_average";
import { FeeRatio, IWatcherService } from "./interface";

export class WatcherService implements IWatcherService {
  private movingAverage = new MovingAverageService();
  private feeHistorySerivce = new FeeHistoryService();

  async getFeeRatio(): Promise<FeeRatio | Error> {
    //fetch curent btc fee from db?
    const currentFee = await this.feeHistorySerivce.getCurrent();

    if (currentFee instanceof Error) {
      return currentFee;
    }

    const currentFeeRate = currentFee.satsPerByte;

    const yearlyMovingAverage = await this.movingAverage.get();
    if (yearlyMovingAverage instanceof Error) {
      return yearlyMovingAverage;
    }
    const ratioCurrentToYearly = currentFeeRate / yearlyMovingAverage.yearly;

    const monthlyMovingAverage = await this.movingAverage.get();
    if (monthlyMovingAverage instanceof Error) {
      return monthlyMovingAverage;
    }
    const ratioCurrentToMonthly = currentFeeRate / monthlyMovingAverage.monthly;

    const feeRatio: FeeRatio = {
      timestamp: currentFee.time,
      currentToYearly: ratioCurrentToYearly,
      currentToMonthly: ratioCurrentToMonthly,
    };

    return feeRatio;
  }
}
