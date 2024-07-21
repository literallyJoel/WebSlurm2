import Elysia from "elysia";
import checkEnvVars from "./helpers/chekEnvVars";
import { localRoutes } from "./routes/localRoutes";
import { oAuthRoutes } from "./routes/oAuthRoutes";
import COLOURS from "./helpers/colours";
import { checkServices } from "./helpers/services/checks";

const app = new Elysia();

async function startService() {
  checkEnvVars();
  const port = process.env.PORT ?? 5161;

  app
    .use((app) => localRoutes(app))
    .use((app) => oAuthRoutes(app))
    .listen(port, (server) => {
      console.log(
        `${COLOURS.green}AuthService is running on ${COLOURS.magenta}${server.url}${COLOURS.reset}`
      );
    });

  await checkServices();
}

startService();
