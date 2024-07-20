import { Elysia } from "elysia";
import { localRoutes } from "./routes/localRoutes";
import { COLOURS } from "./helpers/colours";
import { checkServices } from "./helpers/serviceChecks";
import { handleError } from "./helpers/errorHandler";
import { checkEnvVars } from "./helpers/checkEnvVars";
import { oAuthRoutes } from "./routes/oAuthRoutes";

const app = new Elysia();

async function start() {
  checkEnvVars();
  const port = process.env.PORT || 5161;

  app
    .use((app) => localRoutes(app))
    .use((app) => oAuthRoutes(app))
    .listen(port, (app) => {
      console.log(
        `${COLOURS.green}AuthService is running on ${COLOURS.magenta}${app.url}${COLOURS.reset}`
      );
    });

  await checkServices();
}

start();
