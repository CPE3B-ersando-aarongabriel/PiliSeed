import { handleRouteError, successResponse } from "../../../../lib/apiResponse";
import { verifyToken } from "../../../../lib/authMiddleware";
import { auth } from "../../../../lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);

    await auth.revokeRefreshTokens(uid);

    return successResponse({
      uid,
      message:
        "Server-side tokens revoked. The client should also sign out in Firebase Auth.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
