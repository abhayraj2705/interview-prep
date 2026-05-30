import { v2 as cloudinary } from "cloudinary";

function envValue(key) {
  return process.env[key]?.trim();
}

function hasCloudinaryConfig() {
  return Boolean(
    envValue("CLOUDINARY_URL") ||
      (envValue("CLOUDINARY_CLOUD_NAME") && envValue("CLOUDINARY_API_KEY") && envValue("CLOUDINARY_API_SECRET"))
  );
}

function configureCloudinary() {
  if (!hasCloudinaryConfig()) return false;

  if (!envValue("CLOUDINARY_URL")) {
    cloudinary.config({
      cloud_name: envValue("CLOUDINARY_CLOUD_NAME"),
      api_key: envValue("CLOUDINARY_API_KEY"),
      api_secret: envValue("CLOUDINARY_API_SECRET"),
      secure: true
    });
  }

  return true;
}

export function isDataImage(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,/i.test(value);
}

export async function uploadProfilePhoto(dataUri, userId) {
  if (!configureCloudinary()) {
    const error = new Error("Cloudinary credentials are not configured.");
    error.statusCode = 500;
    throw error;
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "interview-prep/profile-photos",
    public_id: `user-${userId}-${Date.now()}`,
    overwrite: true,
    resource_type: "image",
    transformation: [
      { width: 512, height: 512, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" }
    ]
  });

  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}

export async function deleteCloudinaryAsset(publicId) {
  if (!publicId || !configureCloudinary()) return;
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
}
