import { fetchDate, UTCDate } from "../../lib/date/date";
import { FeeHistory, IFeeHistory } from "./interface";
import { FeeHistoryStore } from "./pg";
import { makeApiCall } from "../../lib/network/network";
export class FeeHistoryService implements IFeeHistory {
  private store = new FeeHistoryStore();

  async getCurrent(): Promise<FeeHistory | Error> {
    const res = await this.store.readLatest();
    return res;
  }

  async getLastYear(): Promise<FeeHistory[] | Error> {
    const today = fetchDate(UTCDate.today);
    const lastYear = fetchDate(UTCDate.lastYear);

    const res = await this.store.readByRange(lastYear, today);

    return res;
  }

  async getLastMonth(): Promise<FeeHistory[] | Error> {
    const today = fetchDate(UTCDate.today);
    const lastMonth = fetchDate(UTCDate.lastMonth);

    const res = await this.store.readByRange(lastMonth, today);
    return res;
  }

  async updateLatest(): Promise<boolean | Error> {
    //fetch fee from mempool:
    const mempoolApiUrl = "https://mempool.space/api/v1/fees/recommended";

    const latestFee = await makeApiCall(mempoolApiUrl, "GET");
    if (latestFee instanceof Error) {
      return latestFee;
    }

    return latestFee["hourFee"];
  }
}
