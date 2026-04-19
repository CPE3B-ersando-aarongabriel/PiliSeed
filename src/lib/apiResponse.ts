import { UnauthorizedError } from "./authMiddleware";
import {
  AnalysisError,
  AnalysisExternalServiceError,
} from "./analysisErrors";

type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export function successResponse<T>(data: T, status = 200) {
  return Response.json(
    {
      success: true,
      message: "Operation completed successfully",
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
      message,
      errors: details === undefined ? [] : [details],
      error: errorPayload,
    },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return errorResponse(401, "UNAUTHORIZED", error.message);
  }

  if (error instanceof AnalysisError) {
    if (error instanceof AnalysisExternalServiceError) {
      return errorResponse(
        error.status >= 400 && error.status < 600 ? error.status : 502,
        error.code,
        error.message,
        error.details,
      );
    }

    return errorResponse(
      error.code === "CONFIGURATION_ERROR" ? 500 : 400,
      error.code,
      error.message,
      undefined,
    );
  }

  if (isFirebaseAdminAuthError(error)) {
    return errorResponse(
      503,
      "FIREBASE_ADMIN_AUTH_FAILED",
      "Server Firebase Admin credentials are not currently valid. Restart the server and verify Firebase service account key/time sync.",
      toFirebaseAdminErrorDetails(error),
    );
  }

  console.error("API route error:", error);

  return errorResponse(
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong while processing this request.",
  );
}

type FirebaseLikeError = {
  code?: string | number;
  message?: string;
  reason?: string;
  details?: string;
};

function isFirebaseAdminAuthError(error: unknown): error is FirebaseLikeError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const typedError = error as FirebaseLikeError;
  const code = String(typedError.code ?? "");
  const reason = String(typedError.reason ?? "");
  const message = String(typedError.message ?? "");
  const details = String(typedError.details ?? "");

  return (
    code === "16" ||
    code.toUpperCase() === "UNAUTHENTICATED" ||
    reason === "ACCESS_TOKEN_EXPIRED" ||
    message.includes("UNAUTHENTICATED") ||
    details.includes("invalid authentication credentials")
  );
}

function toFirebaseAdminErrorDetails(error: FirebaseLikeError) {
  return {
    code: error.code ?? null,
    reason: error.reason ?? null,
    details: error.details ?? null,
  };
}
