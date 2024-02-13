export interface MovingAverage {
  yearly: number;
  monthly: number;
  createdAt: String;
}

export interface IMovingAverage {
  get(): Promise<MovingAverage | Error>;
  update(): Promise<boolean | Error>;
}
