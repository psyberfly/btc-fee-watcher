//fee ratio = current / moving avg
export interface FeeRatio {
  timestamp: String;
  currentToYearly: number;
  currentToMonthly: number;
}

export interface IWatcherService {
  getFeeRatio(): Promise<FeeRatio | Error>;
}
