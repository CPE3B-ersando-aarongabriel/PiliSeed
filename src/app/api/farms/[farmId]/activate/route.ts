export const runtime = "nodejs";

export async function POST() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Farm activation endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
