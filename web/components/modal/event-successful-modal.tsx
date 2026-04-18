import { ROUTES } from "@/app/routes";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UseDiscloseActions } from "@/hooks/use-disclose";
import { Check } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "../shared/clipboard-copy-button";

export const EventSuccessfulModal = ({
  isOpen,
  onToggle,
  slug,
}: UseDiscloseActions & { slug: string }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-md p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Success icon */}
          <div className="bg-[#e91e8c] p-2 rounded-full">
            <Check className="text-white" size={20} strokeWidth={3} />
          </div>

          <DialogTitle className="space-y-2">
            <p className="text-xl font-semibold tracking-tight">
              Event created successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Share your event link with attendees
            </p>
          </DialogTitle>

          {/* Copy link box */}
          <CopyButton
            text={window.location.origin + "/" + slug}
            className="w-full"
          />

          {/* CTA */}
          <Link
            href={ROUTES.host.events}
            onClick={onToggle}
            className="w-full bg-[#e91e8c] hover:bg-[#c4197a] text-white h-11 text-sm font-medium flex items-center justify-center rounded-lg"
          >
            Proceed to dashboard
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
