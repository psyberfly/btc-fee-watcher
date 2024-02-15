import { handleError } from "../../lib/errors/e";
import { FeeOp } from "../fee_estimate/fee_estimate";
import { FeeEstimate } from "../fee_estimate/interface";
import { FeeEstStore } from "../fee_estimate/store/pg";
import { MovingAverageStore } from "../moving_average/store/pg";
import { IIndexOp, Index } from "./interface";
import { IndexStore } from "./store/pg";

export class IndexOp implements IIndexOp {
  updateIndex(currentFee: FeeEstimate): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  private feeOp = new FeeOp();
  private store = new IndexStore();
  private feeEstStore = new FeeEstStore();
  private movingAvgStore = new MovingAverageStore();

  async readLatest(): Promise<Error | Index> {
    const index = await this.store.readLatest();
    if (index instanceof Error) {
      return handleError(index);
    }

    return index;
  }

  async udpateIndex(): Promise<boolean | Error> {
    const currentFeeEst = await this.feeEstStore.readLatest();

    if (currentFeeEst instanceof Error) {
      return handleError(currentFeeEst);
    }

    const movingAvgToday = await this.movingAvgStore.readLatest();

    if (movingAvgToday instanceof Error) {
      return handleError(movingAvgToday);
    }

    const ratioLast365Days = currentFeeEst.satsPerByte /
      movingAvgToday.last365Days;

    const ratioLast30Days = currentFeeEst.satsPerByte /
      movingAvgToday.last30Days;

    const index: Index = {
      feeEstimate: currentFeeEst,
      movingAverage: movingAvgToday,
      ratioLast365Days: ratioLast365Days,
      ratioLast30Days: ratioLast30Days,
      createdAt: null, //added by DB
    };

    this.store.insert(index);
    return true;
  }
}
