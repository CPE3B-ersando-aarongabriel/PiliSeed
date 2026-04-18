export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Geocode endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
