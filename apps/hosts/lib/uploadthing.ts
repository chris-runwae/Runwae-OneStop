import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import type { HostUploadRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<HostUploadRouter>();
export const UploadDropzone = generateUploadDropzone<HostUploadRouter>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<HostUploadRouter>();
