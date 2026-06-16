import { api } from "@/shared/api/client";

type UploadImageApiResponse = {
  url?: string;
  secure_url?: string;
  image_url?: string;
  public_id?: string;
};

export type UploadImageResponse = {
  url: string;
  publicId?: string;
};

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadImageApiResponse>(
    "/api/v1/uploads/imagen",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  const url =
    response.data.url ??
    response.data.secure_url ??
    response.data.image_url;

  if (!url) {
    throw new Error("Cloudinary no devolvió una URL de imagen.");
  }

  return {
    url,
    publicId: response.data.public_id,
  };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await api.delete(`/api/v1/uploads/imagen/${encodeURIComponent(publicId)}`);
};

export const getCloudinaryPublicIdFromUrl = (imageUrl: string): string | null => {
  if (!imageUrl.includes("cloudinary.com")) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.findIndex((segment) => segment === "upload");

    if (uploadIndex === -1) {
      return null;
    }

    const afterUpload = segments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdParts =
      versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;

    if (publicIdParts.length === 0) {
      return null;
    }

    const publicIdWithExtension = publicIdParts.join("/");
    return decodeURIComponent(publicIdWithExtension).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

export const deleteImageFromUrl = async (imageUrl: string): Promise<void> => {
  const publicId = getCloudinaryPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return;
  }

  await deleteImage(publicId);
};
