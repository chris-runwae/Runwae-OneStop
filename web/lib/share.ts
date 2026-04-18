import { toast } from "sonner";

export const shareLink = async (url: string, title?: string) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled
    }
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }
};
