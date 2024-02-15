import { FeeEstimate } from "../fee_estimate/interface";
import { FeeEstMovingAverage } from "../moving_average/interface";

//INDEX
//ratio = currentFeeEst/feeEstMovingAvg
export interface Index {
  feeEstimate: FeeEstimate;
  movingAverage: FeeEstMovingAverage;
  ratioLast365Days: number;
  ratioLast30Days: number;
  createdAt: string;
}

export interface IIndexOp {
  //invoked every 10 min (block)
  updateIndex(currentFee: FeeEstimate): Promise<boolean | Error>;
  readLatest(): Promise<Index | Error>;
}
