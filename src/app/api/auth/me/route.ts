import { handleRouteError, successResponse } from "../../../../lib/apiResponse";
import { verifyToken } from "../../../../lib/authMiddleware";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);

    return successResponse({ uid });
  } catch (error) {
    return handleRouteError(error);
  }
}
