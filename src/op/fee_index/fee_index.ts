import { FeeEstimate, FeeIndex } from "@prisma/client";
import { handleError } from "../../lib/errors/e";
import { FeeOp } from "../fee_estimate/fee_estimate";
//import { FeeEstimate } from "../fee_estimate/interface";
//import { FeeEstPgStore } from "../fee_estimate/store/pg";
//import { MovingAverageStore } from "../moving_average/store/pg";
import { IIndexOp, IndexResponse } from "./interface";
import { FeeIndexPrismaStore } from "./store/prisma";
import { MovingAveragePrismaStore } from "../moving_average/store/prisma";
import { FeeEstimatePrismaStore } from "../fee_estimate/store/prisma";
import { Decimal } from "@prisma/client/runtime/library";
//import { IndexStore } from "./store/pg";

export class IndexOp implements IIndexOp {
  updateIndex(currentFee: FeeEstimate): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  private feeOp = new FeeOp();
  //private store = new IndexStore();
  // private feeEstStore = new FeeEstPgStore();
  // private movingAvgStore = new MovingAverageStore();
  private store = new FeeIndexPrismaStore();
  private movingAvgStore = new MovingAveragePrismaStore();
  private feeEstStore = new FeeEstimatePrismaStore();

  async readLatest(): Promise<Error | IndexResponse> {
    const res = await this.store.fetchLatest();
    if (res instanceof Error) {
      return handleError(res);
    }

    return res;
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

    const ratioLast365Days = currentFeeEst.satsPerByte.toNumber() /
      movingAvgToday.last365Days.toNumber();

    const ratioLast30Days = currentFeeEst.satsPerByte.toNumber() /
      movingAvgToday.last30Days.toNumber();

    const index: FeeIndex = {
      id: null, //added by DB
      feeEstimateId: currentFeeEst.id,
      movingAverageId: movingAvgToday.id,
      ratioLast365Days: new Decimal(ratioLast365Days),
      ratioLast30Days: new Decimal(ratioLast30Days),
      createdAt: null, //added by DB
    };

    this.store.insert(index);
    return true;
  }
}
