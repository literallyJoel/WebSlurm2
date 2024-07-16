type model = "user" | "organisation" | "organisationMember" | "config";
type operation =
  | "getOne"
  | "getMany"
  | "getAlL"
  | "create"
  | "update"
  | " delete"
  | "getUserByEmail";

interface TransactionOperation {
  order: number;
  model: model;
  operation: operation;
  params: any | { $ref: string; field: string };
  resultKey?: string;
  return?: string[];
}

//todo figure out a good method of getting the db service URL automatically
export const dbServiceUrl = "http://localhost:5160";
export async function dbQuery(model: model, operation: operation, params: any) {
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
    console.error(
      "Error calling db service (query): ",
      response.status,
      response.statusText,
      await response.text()
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
    console.error(
      "Error calling db service (transaction): ",
      response.status,
      response.statusText,
      await response.text()
    );

    return null;
  }

  return response.json();
}
