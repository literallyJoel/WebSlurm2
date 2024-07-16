import { COLOURS } from "./colours";
import { dbServiceUrl } from "./serviceCalls";

async function checkDBService() {
  try {
    const dbServicePingUrl = `${dbServiceUrl}/ping`;
    const dbServicePingResponse = await fetch(dbServicePingUrl);
    let dbServicePingResponseJSON: { message: string } | undefined = undefined;

    if (dbServicePingResponse.ok) {
      dbServicePingResponseJSON = await dbServicePingResponse.json();
    }

    if (
      !dbServicePingResponse.ok ||
      dbServicePingResponseJSON?.message !== "pong"
    ) {
      console.warn(
        `${
          COLOURS.yellow
        }Error pinging DB service. AuthService will not function if the DB service cannot be reached. ${
          dbServicePingResponseJSON?.message
            ? `Recieved Response: ${dbServicePingResponse.status} ${dbServicePingResponseJSON.message}`
            : `Recieved Response Code: ${dbServicePingResponse.status} ${dbServicePingResponse.statusText}`
        }.${COLOURS.reset}`
      );
    }

    if (dbServicePingResponseJSON?.message === "pong") {
      console.log(
        `${COLOURS.blue}Recieved response from DB service on ${COLOURS.magenta}${dbServiceUrl}${COLOURS.reset}`
      );
    }
  } catch (e) {
    console.warn(
      `${COLOURS.yellow}Error pinging DB service. AuthService will not function if the DB service cannot be reached.\nReason: ${e}
      ${COLOURS.reset}`
    );
  }
}

export async function checkServices() {
  await checkDBService();
}
