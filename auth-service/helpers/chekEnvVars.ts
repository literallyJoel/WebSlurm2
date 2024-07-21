export default function checkEnvVars() {
  const requiredEnvVars = ["JWT_SECRET", "CORE_SERVICE_URL"];
  let missingEnvVars: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  });

  if (missingEnvVars.length > 0) {
    console.error(
      "The following environment variables are not set:",
      missingEnvVars.join(", ")
    );
    process.exit(1);
  }
}
