import { auth } from "./firebaseAdmin";

export async function verifyToken(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await auth.verifyIdToken(token);

    return decoded.uid;
  } catch (error) {
    throw new Error("Unauthorized");
  }
}
