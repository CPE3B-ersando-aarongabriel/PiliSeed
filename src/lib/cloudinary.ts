import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

type UploadProfileImageInput = {
  uid: string;
  buffer: Buffer;
};

let isCloudinaryConfigured = false;

function getRequiredCloudinaryEnvVar(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function ensureCloudinaryConfigured() {
  if (isCloudinaryConfigured) {
    return;
  }

  cloudinary.config({
    cloud_name: getRequiredCloudinaryEnvVar("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredCloudinaryEnvVar("CLOUDINARY_API_KEY"),
    api_secret: getRequiredCloudinaryEnvVar("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  isCloudinaryConfigured = true;
}

function sanitizeUid(uid: string) {
  return uid.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function uploadProfileImageToCloudinary(
  input: UploadProfileImageInput,
): Promise<string> {
  ensureCloudinaryConfigured();

  const uploadOptions: UploadApiOptions = {
    folder: "piliseed/profile-images",
    public_id: `user_${sanitizeUid(input.uid)}_${Date.now()}`,
    resource_type: "image",
    overwrite: true,
    invalidate: true,
  };

  return await new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure image URL."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(input.buffer);
  });
}
