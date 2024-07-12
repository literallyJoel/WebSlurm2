import type { Knex } from "knex";
import { getDatabase } from "./db";
import { TABLE_NAMES } from "../service-config/schema";
import { ErrorType } from "./errorHandler";

interface TransactionOperation {
  order: number;
  model: "user" | "organisation" | "organisationMember" | "config";
  operation:
    | "getOne"
    | "getMany"
    | "getAll"
    | "create"
    | "update"
    | "delete"
    | "getUserByEmail";
  params: any | { $ref: string; field: string };
  resultKey?: string;
  return?: string[];
}

function validateOrder(arr: number[]) {
  if (arr.length === 0 || Math.min(...arr) !== 1) return false;

  const set = new Set(arr);
  return set.size === arr.length && Math.max(...arr) === arr.length;
}

function resolveReferences(params: any, results: Record<string, any>): any {
  if (typeof params === "object" && params !== null) {
    if ("$ref" in params) {
      return results[params.$ref];
    }
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        resolveReferences(value, results),
      ])
    );
  }
  return params;
}

async function performOperation(
  tx: Knex.Transaction,
  model: "user" | "organisation" | "organisationMember" | "config",
  operation:
    | "getOne"
    | "getMany"
    | "getAll"
    | "create"
    | "update"
    | "delete"
    | "getUserByEmail",
  params: any
) {
  if (!TABLE_NAMES[model]) {
    throw new Error(ErrorType.BAD_REQUEST);
  }
  switch (operation) {
    case "getOne": {
      const result = await tx(TABLE_NAMES[model]).where(params).first();
      if (!result) {
        throw new Error(ErrorType.NOT_FOUND);
      }
      return result;
    }
    case "getMany": {
      const result = await tx(TABLE_NAMES[model]).where(params).select();
      if (result.length === 0) {
        throw new Error(ErrorType.NOT_FOUND);
      }
      return result;
    }
    case "getAll": {
      const result = await tx(TABLE_NAMES[model]).select();
      if (result.length === 0) {
        throw new Error(ErrorType.NOT_FOUND);
      }
      return result;
    }
    case "create":
      return await tx(TABLE_NAMES[model]).insert(params).returning("*");
    case "update":
      return await tx(TABLE_NAMES[model])
        .where(params)
        .update(params)
        .returning("*");
    case "delete":
      return await tx(TABLE_NAMES[model]).where(params).delete();
    case "getUserByEmail":
      if (model !== "user") {
        throw new Error(ErrorType.BAD_REQUEST);
      }
      const user = await tx(TABLE_NAMES.user)
        .where("email", params.email)
        .first();
      if (!user) {
        throw new Error(ErrorType.NOT_FOUND);
      }
      return user;
    default:
      throw new Error(ErrorType.BAD_REQUEST);
  }
}

export async function transaction(operations: TransactionOperation[]) {
  const db = getDatabase();
  if (!db) {
    throw new Error(ErrorType.INTERNAL_SERVER_ERROR);
  }

  const orderArray = operations.map((op) => op.order);
  if (!validateOrder(orderArray)) {
    throw new Error(ErrorType.BAD_REQUEST);
  }

  operations.sort((a, b) => a.order - b.order);
  return db.transaction(async (tx) => {
    const results: Record<string, any> = {};
    const returns: Record<string, any> = {};
    for (const op of operations) {
      // Resolve any references in params
      const resolvedParams = resolveReferences(op.params, results);

      // Perform the operation
      const result = await performOperation(
        tx,
        op.model,
        op.operation,
        resolvedParams
      );

      // Create an object of any fields from the result to return, and then add it to the returns object
      if (op.return) {
        const returnObj: Record<string, any> = {};
        op.return.forEach((field) => {
          if (result && typeof result === "object" && field in result) {
            returnObj[field] = result[field];
          }
        });

        if (Object.keys(returnObj).length > 0) {
          if (!returns[op.model]) {
            returns[op.model] = [];
          }
          returns[op.model].push(returnObj);
        }
      }

      // Store the result if a resultKey is provided
      if (op.resultKey) {
        if (result === undefined) {
          throw new Error(
            `Operation ${op.operation} on ${op.model} returned undefined`
          );
        }
        results[op.resultKey] = result;
      }
    }

    return returns;
  });
}
