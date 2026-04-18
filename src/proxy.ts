import { NextResponse, type NextRequest } from "next/server";

import { verifyTokenWithClaims } from "./lib/authMiddleware";

export async function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  try {
    await verifyTokenWithClaims(request);

    return NextResponse.next();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "A valid Firebase ID token is required for this endpoint.",
        },
      },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: [
    "/api/dashboard/:path*",
    "/api/farms/:path*",
    "/api/location/:path*",
    "/api/profile/:path*",
    "/api/soil/:path*",
    "/api/test/:path*",
  ],
};
