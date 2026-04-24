import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCopyOptions {
  successMessage?: string;
  errorMessage?: string;
  resetDelay?: number;
}

interface UseCopyReturn {
  isCopied: boolean;
  copy: (text: string) => Promise<void>;
  reset: () => void;
}

export const copyToClipboard = async (
  text: string,
  onSuccess?: () => void,
  onError?: (err: unknown) => void,
) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch (err) {
    console.error("Failed to copy text:", err);
    onError?.(err);
  }
};

export const useCopy = (options: UseCopyOptions = {}): UseCopyReturn => {
  const {
    successMessage = "Copied to clipboard",
    errorMessage = "Failed to copy to clipboard",
    resetDelay = 2000,
  } = options;

  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await copyToClipboard(text);
        setIsCopied(true);
        toast.success(successMessage);
        setTimeout(() => setIsCopied(false), resetDelay);
      } catch (err) {
        console.error("Copy failed:", err);
        toast.error(errorMessage);
      }
    },
    [successMessage, errorMessage, resetDelay],
  );

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return {
    isCopied,
    copy,
    reset,
  };
};
