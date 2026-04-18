import { UnauthorizedError } from "./authMiddleware";

type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export function successResponse<T>(data: T, status = 200) {
  return Response.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const errorPayload: ApiErrorPayload = {
    code,
    message,
  };

  if (details !== undefined) {
    errorPayload.details = details;
  }

  return Response.json(
    {
      success: false,
      error: errorPayload,
    },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return errorResponse(401, "UNAUTHORIZED", error.message);
  }

  console.error("API route error:", error);

  return errorResponse(
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong while processing this request.",
  );
}
