import { Elysia, StatusMap, type CookieOptions } from "elysia";
import type { HTTPHeaders, Prettify } from "elysia/types";

export enum ErrorType {
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNKNOWN = "UNKNOWN",
  VALIDATION = "VALIDATION",
  PARSE = "PARSE",
  INVALID_COOKIE_SIGNATURE = "INVALID_COOKIE_SIGNATURE",
}

export interface ErrorResponse {
  error: string;
  status: number;
}

export function handleError(error: Error, type?: ErrorType): ErrorResponse {
  console.error(`Error:`, error);

  // Check for specific error types
  if (isDuplicateKeyError(error)) {
    return { error: "Resource already exists", status: 409 };
  }

  const errorResponses: Record<ErrorType | string, ErrorResponse> = {
    [ErrorType.NOT_FOUND]: { error: "Resource not found", status: 404 },
    [ErrorType.ALREADY_EXISTS]: {
      error: "Resource already exists",
      status: 409,
    },
    [ErrorType.BAD_REQUEST]: { error: "Bad request", status: 400 },
    [ErrorType.UNAUTHORIZED]: { error: "Unauthorized", status: 401 },
    [ErrorType.FORBIDDEN]: { error: "Forbidden", status: 403 },
    [ErrorType.INTERNAL_SERVER_ERROR]: {
      error: "Internal server error",
      status: 500,
    },
    [ErrorType.UNKNOWN]: { error: "Internal server error", status: 500 },
    [ErrorType.VALIDATION]: { error: "Bad request", status: 400 },
    [ErrorType.PARSE]: { error: "Bad request", status: 400 },
    [ErrorType.INVALID_COOKIE_SIGNATURE]: {
      error: "Invalid cookie signature",
      status: 401,
    },
  };

  if (type) {
    return (
      errorResponses[type] ||
      errorResponses[error.message] ||
      errorResponses[ErrorType.INTERNAL_SERVER_ERROR]
    );
  }
  return (
    errorResponses[error.message] ||
    errorResponses[ErrorType.INTERNAL_SERVER_ERROR]
  );
}

function isDuplicateKeyError(error: Error): boolean {
  const errorString = error.toString().toLowerCase();
  return (
    errorString.includes("duplicate") ||
    errorString.includes("unique constraint") ||
    errorString.includes("uniqueviolation") ||
    errorString.includes("primary key constraint") ||
    (error as any).code === "23505" // Common PostgreSQL code for unique violation
  );
}

export function elysiaErrorHandler(
  code:
    | "UNKNOWN"
    | "VALIDATION"
    | "NOT_FOUND"
    | "PARSE"
    | "INTERNAL_SERVER_ERROR"
    | "INVALID_COOKIE_SIGNATURE",
  error: Readonly<Error>,
  set: {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, Prettify<CookieOptions & { value?: unknown }>>;
  }
) {
  switch (code) {
    case "NOT_FOUND": {
      const errorResponse = handleError(error, ErrorType.NOT_FOUND);
      set.status = errorResponse.status;
      return errorResponse;
    }
    case "VALIDATION": {
      const errorResponse = handleError(error, ErrorType.VALIDATION);
      set.status = errorResponse.status;
      return errorResponse;
    }
    case "PARSE": {
      const errorResponse = handleError(error, ErrorType.PARSE);
      set.status = errorResponse.status;
      return errorResponse;
    }
    case "INVALID_COOKIE_SIGNATURE": {
      const errorResponse = handleError(
        error,
        ErrorType.INVALID_COOKIE_SIGNATURE
      );
      set.status = errorResponse.status;
      return errorResponse;
    }
    default: {
      const errorResponse = handleError(error);
      set.status = errorResponse.status;
      return errorResponse;
    }
  }
}
