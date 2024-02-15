import { Index } from "../../op/index/interface";

export interface IServiceProvider {
  getIndex(): Promise<Index | Error>;    
    
}
