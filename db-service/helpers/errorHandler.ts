
export enum ErrorType {
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export interface ErrorResponse {
  error: string;
  status: number;
}

export function handleError(error: unknown, type?: ErrorType): ErrorResponse {
  console.error(`Error:`, error);

  if (error instanceof Error) {
    // Check for specific error types
    if (isDuplicateKeyError(error)) {
      return { error: "Resource already exists", status: 409 };
    }
  }

  // Handle specific error types
  switch (type) {
    case ErrorType.NOT_FOUND:
      return { error: "Resource not found", status: 404 };
    case ErrorType.ALREADY_EXISTS:
      return { error: "Resource already exists", status: 409 };
    case ErrorType.BAD_REQUEST:
      return { error: "Bad request", status: 400 };
    case ErrorType.UNAUTHORIZED:
      return { error: "Unauthorized", status: 401 };
    case ErrorType.FORBIDDEN:
      return { error: "Forbidden", status: 403 };
    default:
      return { error: "Internal server error", status: 500 };
  }
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
