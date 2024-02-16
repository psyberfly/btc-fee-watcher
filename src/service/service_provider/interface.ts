import { FeeIndex } from "@prisma/client";
import { IndexResponse } from "../../op/fee_index/interface";

export interface IServiceProvider {
  getIndex(): Promise<IndexResponse | Error>;
}
