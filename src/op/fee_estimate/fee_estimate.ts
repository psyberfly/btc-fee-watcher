import { fetchDate, UTCDate } from "../../lib/date/date";
import { FeeEstimate, IFeeEstimateOp } from "./interface";
import { FeeHistoryStore } from "./pg";
import { makeApiCall } from "../../lib/network/network";
import { handleError } from "../../lib/errors/e";
export class FeeOp implements IFeeEstimateOp {
  private mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";
  private store = new FeeHistoryStore();

  async readLatest(): Promise<FeeEstimate | Error> {
    const res = await this.store.readLatest();
    return res;
  }

  async readLast365Days(): Promise<FeeEstimate[] | Error> {
    const today = fetchDate(UTCDate.today);
    const lastYear = fetchDate(UTCDate.lastYear);

    const res = await this.store.readByRange(lastYear, today);

    return res;
  }

  async readLast30Days(): Promise<FeeEstimate[] | Error> {
    const today = fetchDate(UTCDate.today);
    const lastMonth = fetchDate(UTCDate.lastMonth);

    const res = await this.store.readByRange(lastMonth, today);
    return res;
  }

  async fetchUpdateCurrent(): Promise<FeeEstimate | Error> {
    const res = await makeApiCall(this.mempoolApiUrl, "GET");

    if (res instanceof Error) {
      console.error("Error fetching fee estimate from API!");
      handleError(res);
    }

    const satsPerByte = res["fastestFee"];

    if (!satsPerByte) {
      return handleError({
        code: 404,
        message: "Null Fee Estimate fetched from API",
      });
    }

    const currentfeeEstimate: FeeEstimate = {
      time: new Date().toUTCString(),
      satsPerByte: satsPerByte,
    };

    this.store.create(currentfeeEstimate);

    return currentfeeEstimate;
  }
}
