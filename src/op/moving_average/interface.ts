//Every day, calculate moving average of 1. past 365 days, 2. past 30 days
export interface MovingAverage {
  yearly: number;
  monthly: number;
  createdAt: String;
}

export interface IMovingAverage {
  get(): Promise<MovingAverage | Error>;
  update(): Promise<boolean | Error>;
}
