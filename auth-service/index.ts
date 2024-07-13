import { Elysia } from "elysia";
import { localRoutes } from "./routes/localRoutes";
import { COLOURS } from "./helpers/colours";
import { checkServices } from "./helpers/serviceChecks";
const app = new Elysia();

async function start() {
  const port = process.env.PORT || 5161;
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("Environment variable JWT_SECRET must be set. ");
    process.exit(1);
  }
  app
    .use((app) => localRoutes(app))
    .listen(port, (app) => {
      console.log(
        `${COLOURS.green}AuthService is running on ${COLOURS.magenta}${app.url}${COLOURS.reset}`
      );
    });

  await checkServices();
}

start();
