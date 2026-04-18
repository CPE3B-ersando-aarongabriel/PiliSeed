export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Farms listing endpoint is not implemented yet.",
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
        message: "Farm creation endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
