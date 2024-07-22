import COLOURS from "../colours";
import { dbServiceUrl } from "./calls";

async function checkDBService() {
  const maxRetries = 3;
  const baseDelay = 4000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      //Ping the db service
      const dbServicePingUrl = `${dbServiceUrl}/ping`;
      const dbServicePingResponse = await fetch(dbServicePingUrl);
      let dbServicePingResponseJSON: { message: string } | undefined =
        undefined;

      //If there's a response, we parse it
      if (dbServicePingResponse.ok) {
        dbServicePingResponseJSON = await dbServicePingResponse.json();
      }

      //We ensure the response is ok and the expected message is returned
      if (
        dbServicePingResponse.ok &&
        dbServicePingResponseJSON?.message === "pong"
      ) {
        console.log(
          `${COLOURS.blue}Received response from DB service on ${COLOURS.magenta}${dbServiceUrl}${COLOURS.reset}`
        );
        return;
      }

      //Otherwise throw an error
      throw new Error(
        dbServicePingResponseJSON?.message
          ? `Received Response: ${dbServicePingResponse.status} ${dbServicePingResponseJSON.message}`
          : `Received Response Code: ${dbServicePingResponse.status} ${dbServicePingResponse.statusText}`
      );
    } catch (e) {
      //Log a warning if we've reached the max retries
      if (attempt === maxRetries - 1) {
        console.warn(
          `${COLOURS.yellow}Error pinging DB service after ${maxRetries} attempts. AuthService will not function if the DB service cannot be reached.\nReason: ${e}
          ${COLOURS.reset}`
        );
      } else {
        //Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(
          `${COLOURS.red}Could not reach DB service. Retrying in ${delay}ms...${COLOURS.reset}`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

export async function checkServices() {
  await checkDBService();
}
