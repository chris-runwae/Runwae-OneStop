export const uploadToCloudinary = async (
  file: File | string,
): Promise<string> => {
  if (typeof file === "string") return file; // already a URL

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Image upload failed");

  const data = await res.json();
  return data.secure_url;
};
