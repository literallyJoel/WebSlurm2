import type { Knex } from "knex";
import { getDatabase } from "./db";
import { TABLE_NAMES } from "../db/schema";
import { ErrorType } from "@webslurm2/shared";
import type { ModelName, OperationName } from "@webslurm2/shared";

interface TransactionOperation {
  order: number;
  model: ModelName;
  operation: OperationName;
  params: any | { $ref: string; field: string };
  resultKey?: string;
  return?: string[];
}

function validateOrder(arr: number[]) {
  if (arr.length === 0 || Math.min(...arr) !== 1) return false;

  const set = new Set(arr);
  return set.size === arr.length && Math.max(...arr) === arr.length;
}

function resolveReferences(params: any, results: Record<string, any[]>): any {
  if (typeof params === "object" && params !== null) {
    if ("$ref" in params && "field" in params) {
      const refArray = results[params.$ref];
      if (!refArray || refArray.length === 0) {
        throw new Error(`Reference "${params.$ref}" not found in results`);
      }

      const lastItem = refArray[refArray.length - 1];
      if (!(params.field in lastItem)) {
        throw new Error(
          `Field "${params.field}" not found in reference "${params.$ref}"`
        );
      }
      return lastItem[params.field];
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
  model: ModelName,
  operation: OperationName,
  params: any
) {
  if (!TABLE_NAMES[model]) {
    throw new Error(ErrorType.BAD_REQUEST);
  }
  switch (operation) {
    case "getOne": {
      const result = await tx(TABLE_NAMES[model]).where(params).first();
      return result;
    }
    case "getMany": {
      const result = await tx(TABLE_NAMES[model]).where(params).select();
      return result;
    }
    case "getAll": {
      const result = await tx(TABLE_NAMES[model]).select();
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
      return user;
    default:
      throw new Error(ErrorType.BAD_REQUEST);
  }
}

export default async function transaction(operations: TransactionOperation[]) {
  const db = getDatabase();
  if (!db) {
    throw new Error(ErrorType.INTERNAL_SERVER_ERROR);
  }

  const orderArray = operations.map((op) => op.order);

  if (!validateOrder(orderArray)) {
    throw new Error(ErrorType.BAD_REQUEST);
  }

  operations.sort((a, b) => a.order - b.order);
  return await db.transaction(async (tx) => {
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
          if (
            result &&
            result[0] &&
            typeof result[0] === "object" &&
            field in result[0]
          ) {
            returnObj[field] = result[0][field];
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
