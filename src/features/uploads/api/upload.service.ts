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
