import { CheckCircle2, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AcceptedSuccessModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-xs rounded-2xl bg-white p-8 shadow-xl text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-black transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-center mb-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="size-10 text-white" strokeWidth={2} />
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-black">Accepted Vendor!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The Vendor's vendor verification has been updated.
        </p>
      </div>
    </div>
  );
}
