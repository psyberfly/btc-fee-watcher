export interface IServiceProvider {
  getFeeRatio(): Promise<FeeAvgRatio | Error>;    
    
}
