import { r_500 } from "../../lib/logger/winston";
import { filterError, parseRequest, respond } from "../../lib/http/handler";
import { ServiceProvider } from "./service_provider";

const watcherService = new ServiceProvider();

export async function handleGetIndex(req, res) {
  console.log("Handling req....");
  const request = parseRequest(req);
  try {
    let index = await watcherService.getIndex();

    if (index instanceof Error) {
      throw index;
    }
    await respond(200, index, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}
