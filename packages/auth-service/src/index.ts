import Elysia from "elysia";
import checkEnvVars from "./helpers/checkEnvVars";
import { localRoutes } from "./routes/localRoutes";
import { oAuthRoutes } from "./routes/oAuthRoutes";
import { COLOURS } from "@webslurm2/shared";
import { checkDBService } from "@webslurm2/shared";

checkEnvVars();
const port = process.env.PORT ?? 5161;
//Exported for tests
export const app = new Elysia()
  .use((app) => localRoutes(app))
  .use((app) => oAuthRoutes(app))
  .listen(port, (server) => {
    console.log(
      `${COLOURS.green}AuthService is running on ${COLOURS.magenta}${server.url}${COLOURS.reset}`
    );
  });

checkDBService();
