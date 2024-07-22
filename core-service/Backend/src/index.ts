import { Elysia } from "elysia";
import { setupRoutes } from "./routes/setup";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .group("/api", (app) => app.use(setupRoutes(app)))
  .listen(process.env.PORT ?? 5162, (server) => {
    console.log(`Core Service is running on ${server.url}`);
  });
