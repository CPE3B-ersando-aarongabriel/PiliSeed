export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Latest soil profile endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
