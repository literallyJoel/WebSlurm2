type model = "user" | "organisation" | "organisationMember";
type operation =
  | "getOne"
  | "getMany"
  | "getAlL"
  | "create"
  | "update"
  | " delete"
  | "getUserByEmail";

//todo figure out a good method of getting the db service URL automatically
const dbServiceUrl = "http://localhost:5160/query";
export async function callDBService(
  model: model,
  operation: operation,
  params: any
) {
  const response = await fetch(dbServiceUrl, {
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
      "Error calling db service: ",
      response.status,
      response.statusText
    );

    return null;
  }

  return response.json();
}
