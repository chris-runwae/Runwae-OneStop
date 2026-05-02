import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { AdminUploadRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<AdminUploadRouter>();
export const UploadDropzone = generateUploadDropzone<AdminUploadRouter>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AdminUploadRouter>();
