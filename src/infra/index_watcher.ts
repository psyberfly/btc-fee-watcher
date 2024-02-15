import { handleError } from "../lib/errors/e";
import { ONE_DAY_MS, TEN_MINUTES_MS } from "../lib/time/time";
import { FeeOp } from "../op/fee_estimate/fee_estimate";
import { IndexOp } from "../op/index";
import { MovingAverageOp } from "../op/moving_average/moving_average";
import { AlertStreamServer } from "./wss";

export async function runIndexWatcher() {
  try {
    const feeOp = new FeeOp();
    const movingAverageOp = new MovingAverageOp();
    const indexOp = new IndexOp();
    const port: string = process.env.WSS_PORT;
    const path: string = process.env.WSS_PATH;

    const alertStreamServer = new AlertStreamServer(port, path);

    // every day:
    setInterval(async () => {
      await movingAverageOp.update();
      // update chart
    }, ONE_DAY_MS);

    // every 10 mins (block):
    setInterval(async () => {
      // fetch current fee estimate and update DB
      const currentFeeEstimate = await feeOp.updateCurrent();
      if (currentFeeEstimate instanceof Error) {
        return handleError(currentFeeEstimate);
      }
      // calculate index and update DB
      const isIndexUpdated = await indexOp.udpateIndex();

      if (isIndexUpdated instanceof Error) {
        return handleError(isIndexUpdated);
      }

      const latestIndex = await indexOp.readLatest();

      if (latestIndex instanceof Error) {
        return handleError(latestIndex);
      }

      alertStreamServer.broadcastAlert(latestIndex);
      // update chart
    }, TEN_MINUTES_MS);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}
