import express, { Request, Response } from "express";
import { PgStore } from "./db";
import { router as serviceRouter } from "../service/service_provider/router";
import * as dotenv from "dotenv";
dotenv.config();
export async function runServer() {
  try {
    const app = express();
    const port: string = process.env.SERVER_PORT;
    const path: string = process.env.SERVER_PATH;

    app.get("/", (req: Request, res: Response) => {
      res.send("Hello from BTC Fee Watcher!");
    });
    app.use(path, serviceRouter);
    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  } 
}
