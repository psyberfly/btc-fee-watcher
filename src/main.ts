import { runServer } from "./infra/server";
import { runIndexWatcher } from "./infra/index_watcher";
import { initDB } from "./infra/db";

async function startService() {
  try {
    await initDB();
    await runServer();
    await runIndexWatcher();
  } catch (error) {
    console.error(`Error running Service:${error}`);
    process.exit(1);
  }
}

startService();
