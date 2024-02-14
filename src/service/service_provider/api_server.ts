import { FeeOp } from "../../op/fee_estimate/fee_estimate";
import { Watcher } from "../../op/index";
import { FeeRatio, IWatcherService } from "./interface";

export class WatcherService implements IWatcherService {
  private movingAverage = new Watcher();
  private feeHistorySerivce = new FeeOp();

 
}
