import express, { Request, Response } from "express";
import { FeeHistoryStore } from "./fee_history/pg";
import { router as watcherRouter } from "./watcher/router";
import { MovingAverageStore } from "./moving_average/pg";

async function startServer() {
  try {
    
    // Init table creation if not exist:
    const feeHistoryStore = new FeeHistoryStore();
    const movingAverageStore = new MovingAverageStore();
    await feeHistoryStore.initTable();
    await movingAverageStore.initTable();
  
    const app = express();

    // Define a route
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello from BTC Fee Watcher!");
    });

    app.use("/service", watcherRouter);

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    // Handle the error appropriately (e.g., exit the process)
    process.exit(1);
  }
}

startServer();
