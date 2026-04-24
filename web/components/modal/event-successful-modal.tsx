import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UseDiscloseActions } from "@/hooks/use-disclose";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { CopyButton } from "../shared/clipboard-copy-button";
import Link from "next/link";
import { ROUTES } from "@/app/routes";

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

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Event created successfully!
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your event link with attendees
            </p>
          </div>

          {/* Copy link box */}
          <CopyButton text={slug} className="w-full" />

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
