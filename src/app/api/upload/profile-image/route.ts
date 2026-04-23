import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import { uploadProfileImageToCloudinary } from "../../../../lib/cloudinary";

export const runtime = "nodejs";

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseImageFile(formData: FormData) {
  const fileValue = formData.get("file");

  if (
    !fileValue ||
    typeof fileValue === "string" ||
    typeof fileValue.arrayBuffer !== "function"
  ) {
    return null;
  }

  return fileValue;
}

export async function POST(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return errorResponse(
        400,
        "INVALID_CONTENT_TYPE",
        "Request content type must be multipart/form-data.",
      );
    }

    const formData = await request.formData();
    const imageFile = parseImageFile(formData);

    if (!imageFile) {
      return errorResponse(
        400,
        "MISSING_FILE",
        'Profile image is required in form field "file".',
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      return errorResponse(
        400,
        "UNSUPPORTED_FILE_TYPE",
        "Only JPG, PNG, and WEBP image files are supported.",
      );
    }

    if (imageFile.size <= 0) {
      return errorResponse(400, "EMPTY_FILE", "Uploaded image file is empty.");
    }

    if (imageFile.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      return errorResponse(
        400,
        "FILE_TOO_LARGE",
        "Image size must be 5MB or less.",
      );
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const profileImageUrl = await uploadProfileImageToCloudinary({
      uid: decodedToken.uid,
      buffer: imageBuffer,
    });

    return successResponse({
      profileImageUrl,
      photoURL: profileImageUrl,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
