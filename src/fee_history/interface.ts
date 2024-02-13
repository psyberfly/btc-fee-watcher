export interface FeeHistory {
  time: String; //UTC
  satsPerByte: number; //1-2 blocks
}

export interface IFeeHistory {
  getLastYear(): Promise<FeeHistory[] | Error>;
  getLastMonth(): Promise<FeeHistory[] | Error>;
  getCurrent():Promise<FeeHistory | Error>;
}
