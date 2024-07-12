let runtimeConfig: { dbType: string; connectionString: string } | null = null;

export function getRuntimeConfig() {
  return (
    runtimeConfig || {
      dbType: process.env.DATABASE_TYPE,
      connectionString: process.env.DATABASE_CONNECTION_STRING,
    }
  );
}

export async function setRuntimeConfig(
  dbType: string,
  connectionString: string
) {
  runtimeConfig = { dbType, connectionString };
  await Bun.write(
    ".env",
    `DATABASE_TYPE=${dbType}\nDATABASE_CONNECTION_STRING=${connectionString}`
  );
}

