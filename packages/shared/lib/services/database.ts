import { handleError } from "../helpers";
import type { ModelName, OperationName, TransactionOperation } from "../types";
import { dbServiceUrl } from "../constants";

export async function dbQuery(
  model: "user",
  operation: OperationName,
  params: any
): Promise<any>;
export async function dbQuery(
  model: ModelName,
  operation: Exclude<OperationName, "getUserByEmail">,
  params: any
): Promise<any>;
export async function dbQuery(
  model: ModelName,
  operation: OperationName,
  params = {}
) {
  const response = await fetch(`${dbServiceUrl}/query`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model,
      operation,
      params,
    }),
  });

  //todo figure out the best way to handle errors
  if (!response.ok) {
    console.error(model, operation, params, `${dbServiceUrl}/query`);
    handleError(
      new Error(
        `Error calling db service (query): ${response.status} ${
          response.statusText
        } ${await response.text()}`
      )
    );

    return null;
  }

  return response.json();
}

export async function dbTransaction(operations: TransactionOperation[]) {
  const body = JSON.stringify({
    operations,
  });

  const response = await fetch(`${dbServiceUrl}/transaction`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: body,
  });

  //todo figure out the best way to handle errors
  if (!response.ok) {
    handleError(
      new Error(
        `Error calling db service (transaction): ${response.status} ${
          response.statusText
        } ${await response.text()}`
      )
    );

    return null;
  }

  return response.json();
}
