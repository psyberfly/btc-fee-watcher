import { fetchDate, UTCDate } from "../../lib/date/date";
import { FeeEstimate, IFeeEstimateOp } from "./interface";
import { FeeEstStore } from "./store/pg";
import { makeApiCall } from "../../lib/network/network";
import { handleError } from "../../lib/errors/e";
export class FeeOp implements IFeeEstimateOp {
  private mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";
  private store = new FeeEstStore();

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

  async updateCurrent(): Promise<boolean | Error> {
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
      id: null, //Added by DB,
    };

    const isUpdated = await this.store.create(currentfeeEstimate);

    if (isUpdated instanceof Error) {
      return handleError(isUpdated);
    }
    return true;
  }
}
