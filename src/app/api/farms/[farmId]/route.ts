export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Farm details endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}

export async function PATCH() {
  return Response.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Farm update endpoint is not implemented yet.",
      },
    },
    { status: 501 },
  );
}
