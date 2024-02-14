import { filterError, parseRequest, respond } from "../lib/http/handler";
import { r_500 } from "../lib/logger/winston";
import { WatcherService } from "./api_server";


const watcherService = new WatcherService();

export async function handleGetFeeRatio(req, res) {
    console.log("handling....")
    const request = parseRequest(req);
    try {
        let response = await watcherService.getFeeRatio();
        if (response instanceof Error) throw response;
        else respond(200, response, res, request);
    }
    catch (e) {
        const result = filterError(e, r_500, request);
        respond(result.code, result.message, res, request);
    }
};

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}
