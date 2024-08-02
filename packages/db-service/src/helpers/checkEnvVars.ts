import { COLOURS } from "@webslurm2/shared";
import allowedDbTypes from "../constants/allowedDbTypes";

function checkDbType() {
  const dbType = process.env.DB_TYPE;

  if (dbType && !allowedDbTypes.includes(dbType)) {
    console.error(
      "DB_TYPE is not set to a valid value. Please set it to one of the following values:" +
        COLOURS.magenta,
      allowedDbTypes.join(", ")
    );
    process.exit(1);
  }
}

//There's only one to check, but we use a separate function so we can more easily add more later.
export function checkEnvVars() {
  checkDbType();
}
