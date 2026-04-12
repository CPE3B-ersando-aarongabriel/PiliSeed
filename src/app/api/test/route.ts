import { verifyToken } from "../../../lib/authMiddleware";

export async function GET(req: Request) {
  try {
    const uid = await verifyToken(req);

    return Response.json({
      success: true,
      uid,
    });
  } catch (err) {
    console.error("API ERROR:", err); // 👈 ADD THIS

    return Response.json(
      {
        error: String(err),
      },
      { status: 500 },
    );
  }
}
