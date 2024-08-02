let runtimeConfig: { dbType: string; connectionString: string } | null = null;

export function getRuntimeConfig() {
  return (
    runtimeConfig ?? {
      dbType: process.env.DB_TYPE,
      connectionString: process.env.DATABASE_CONNECTION_STRING,
    }
  );
}

export async function setRuntimeConfig(
  dbType: string,
  connectionString: string
) {
  if (dbType === "" && connectionString === "") {
    runtimeConfig = null;
  } else {
    runtimeConfig = { dbType, connectionString };
  }

  if (dbType) {
    process.env["DATABASE_TYPE"] = dbType;
  } else {
    delete process.env["DATABASE_TYPE"];
  }

  if (connectionString) {
    process.env["DATABASE_CONNECTION_STRING"] = connectionString;
  } else {
    delete process.env["DATABASE_CONNECTION_STRING"];
  }

  await Bun.write(
    ".env",
    `${dbType ? `DATABASE_TYPE=${dbType}\n` : ""}${
      connectionString ? `DATABASE_CONNECTION_STRING=${connectionString}\n` : ""
    }`
  );
}
