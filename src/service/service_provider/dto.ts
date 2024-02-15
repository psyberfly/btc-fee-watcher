import { r_500 } from "../../lib/logger/winston";
import { filterError, parseRequest, respond } from "../../lib/http/handler";
import { ServiceProvider } from "./service_provider";

const watcherService = new ServiceProvider();

export async function handleGetIndex(req, res) {
  console.log("handling....");
  const request = parseRequest(req);
  try {
    let response = await watcherService.getIndex();
    if (response instanceof Error) throw response;
    else respond(200, response, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    respond(result.code, result.message, res, request);
  }
}

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}
