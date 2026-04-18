export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Soil profile endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}

export async function POST() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Soil profile create endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
