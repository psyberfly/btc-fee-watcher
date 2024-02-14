import { FeeEstimate } from "../fee_estimate/interface";

//INDEX
export interface FeeEstMovingAverage {
    createdAt: String;
    last365Days: number;
    last30Days: number;
  }
  
  //ratio = currentFeeEst/feeEstMovingAvg
  export interface Index {
    currentFeeEst: FeeEstimate;
    movingAverage: FeeEstMovingAverage;
    ratioYearly: number;
    ratioMonthly: number;
  }
  
  export interface IIndexWatcher {
    //invoked daily
    updateMovingAverages(): Promise<boolean | Error>;
    //invoked every 10 min (block)
    updateFeeAvgRatio(currentFee: FeeEstimate): Promise<boolean | Error>;
  }
  
