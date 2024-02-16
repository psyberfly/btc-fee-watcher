import { FeeIndex } from "@prisma/client";
import { handleError } from "../../lib/errors/e";
import { IndexOp } from "../../op/index/index";
import { IServiceProvider } from "./interface";

export class ServiceProvider implements IServiceProvider {
  private indexOp = new IndexOp();

  async getIndex(): Promise<Error | FeeIndex> {
    const index = await this.indexOp.readLatest();
    if (index instanceof Error) {
      return handleError(index);
    }
    return index;
  }
}
