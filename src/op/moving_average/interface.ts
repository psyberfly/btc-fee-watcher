//MOVING AVG:

export interface FeeEstMovingAverage {
  id: number;
  createdAt: String;
  last365Days: number;
  last30Days: number;
}

export interface IMovingAverageOp {
  //invoked daily
  readLatest(): Promise<FeeEstMovingAverage | Error>;
  update(): Promise<boolean | Error>;
}
