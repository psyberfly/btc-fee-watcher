//fee ratio = current / moving avg
export interface FeeRatio {
  timestamp: String;
  currentToYearly: number;
  currentToMonthly: number;
}

export interface IWatcherService {
  //watchFee(): P
  getFeeRatio(): Promise<FeeRatio | Error>;
  
}
