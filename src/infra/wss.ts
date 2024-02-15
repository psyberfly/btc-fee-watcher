import express from "express";
import { WebSocketServer } from "ws";
import { TEN_MINUTES_MS } from "../lib/time/time";
import { Index } from "../op/index/interface";
import { alertStreamPath } from "../service/service_provider/router";
import http from "http";
import * as dotenv from "dotenv";
import { handleError } from "../lib/errors/e";
dotenv.config();

export class AlertStreamServer {
  private port: string;
  private path: string;
  private static alertStreamServer: WebSocketServer;

  constructor(port: string, path: string) {
    this.port = port;
    this.path = path;
    AlertStreamServer.initAlertStream(this.port, this.path);
  }

  private static initAlertStream(port: string, path: string) {
    try {
      const app = express();
      const server = http.createServer(app);

      AlertStreamServer.alertStreamServer = new WebSocketServer({
        server,
        path,
      });

      function broadcastAlert(data: string) {
        AlertStreamServer.alertStreamServer.clients.forEach((client) => {
          client.send(data);
        });
      }

      AlertStreamServer.alertStreamServer.on("connection", (ws) => {
        ws.on("message", (message) => {
          console.log("Received:", message);
        });
      });
      server.listen(port, () => {
        console.log(`WS Server running on port ${port}`);
      });
    } catch (error) {
      console.error("Error starting WS Server:", error);
      process.exit(1);
    } finally {
      //graceful shutdown
    }
  }

  public broadcastAlert(data: Index): boolean {
    try {
      // Broadcast to all connected clients
      AlertStreamServer.alertStreamServer.clients.forEach((client) => {
        client.send(JSON.stringify(data));
      });
    } catch (e) {
      console.error("AlertStreamServer: Error during broadcast!");
      handleError(e);
    }

    return true;
  }
}