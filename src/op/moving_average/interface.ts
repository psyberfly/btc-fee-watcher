//MOVING AVG:

export interface FeeEstMovingAverage {
  id: number;
  createdAt: string;
  last365Days: number;
  last30Days: number;
}

export interface IMovingAverageOp {
  //invoked daily
  readLatest(): Promise<FeeEstMovingAverage | Error>;
  create(): Promise<boolean | Error>;
  checkExists(DateUTC: string): Promise<boolean | Error>;
}
