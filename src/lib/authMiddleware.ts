import type { DecodedIdToken } from "firebase-admin/auth";

import { auth } from "./firebaseAdmin";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new UnauthorizedError("Missing Authorization header.");
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Authorization header must use Bearer token.");
  }

  return token;
}

export async function verifyTokenWithClaims(
  request: Request,
): Promise<DecodedIdToken> {
  try {
    const token = getBearerToken(request);

    return await auth.verifyIdToken(token);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError("Invalid or expired Firebase ID token.");
  }
}

export async function verifyToken(request: Request) {
  const decoded = await verifyTokenWithClaims(request);

  return decoded.uid;
}
