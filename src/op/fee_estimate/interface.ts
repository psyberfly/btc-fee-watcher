//FEE ESTIMATE

export interface FeeEstimate {
  time: String; //UTC
  satsPerByte: number; //1-2 blocks/fastest
}


export interface IFeeEstWatcher {
  readLast365Days(): Promise<FeeEstimate[] | Error>;
  readLast30Days(): Promise<FeeEstimate[] | Error>;
  readLatest(): Promise<FeeEstimate | Error>;
  fetchUpdateCurrent(): Promise<FeeEstimate | Error>;
}





