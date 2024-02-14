import { handleError } from "../lib/errors/e";
import { ONE_DAY_MS, TEN_MINUTES_MS } from "../lib/time/time";
import { FeeOp } from "../op/fee_estimate/fee_estimate";
import { IndexerWatcher } from "../op/index";
import { AlertStreamServer } from "./wss";

export async function runIndexWatcher() {
    try {
      const feeOp = new FeeOp();
      const watcher = new IndexerWatcher();
      const port: string = process.env.WSS_PORT;
      const path: string = process.env.WSS_PATH;
  
      const alertStreamServer = new AlertStreamServer(port, path);
  
      // every day:
      setInterval(async () => {
        await watcher.updateFeeEstMovingAverages();
        // update chart
      }, ONE_DAY_MS);
  
      // every 10 mins (block):
      setInterval(async () => {
        // fetch current fee estimate and update DB
        const currentFeeEstimate = await feeOp.fetchUpdateCurrent();
        if (currentFeeEstimate instanceof Error) {
          return handleError(currentFeeEstimate);
        }
        // calculate ratio and update DB
        const index = await watcher.udpateIndex(currentFeeEstimate);
        if (index instanceof Error) {
          return handleError(index);
        }
        alertStreamServer.broadcastAlert(index);
        // update chart
      }, TEN_MINUTES_MS);
    } catch (error) {
      console.error("Error starting server:", error);
      process.exit(1);
    }
  }
  