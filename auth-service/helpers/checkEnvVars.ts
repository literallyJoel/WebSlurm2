import { env } from "bun";

export function checkEnvVars() {
  const requiredEnvVars = ["JWT_SECRET", "FRONTEND_URL"];

  let missingEnvVars: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }
}
