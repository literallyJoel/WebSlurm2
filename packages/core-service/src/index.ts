import { Elysia } from "elysia";
import { setupRoutes } from "./routes/setup";
import { authRoutes } from "./routes/auth";

//exported for tests
export const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .group("/api", (app) => app.use(setupRoutes(app).use(authRoutes(app))))
  .listen(process.env.PORT ?? 5162, (server) => {
    console.log(`Core Service is running on ${server.url}`);
  });
