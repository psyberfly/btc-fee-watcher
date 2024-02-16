import { FeeIndex } from "@prisma/client";

export interface IServiceProvider {
  getIndex(): Promise<FeeIndex | Error>;    
    
}
