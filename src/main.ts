import { runServer } from "./infra/server";
import { runIndexWatcher } from "./infra/index_watcher";
import { initDB, PgStore } from "./infra/db";

async function startService() {
  try {
    await initDB();
    await runServer();
    await runIndexWatcher();
  } catch (error) {
    console.error(`Error running Service:${error}`);
    await PgStore.disconnectDb();
    process.exit(1);
  }
}

startService();
