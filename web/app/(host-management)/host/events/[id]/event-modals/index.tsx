"use client";

import { Dialog } from "@/components/ui/dialog";
import type { EventModalType, EventModalsProps } from "./types";
import { AddHostModal } from "./AddHostModal";
import { AddSubEventModal } from "./AddSubEventModal";
import { ConfigureHostModal } from "./ConfigureHostModal";
import { InviteGuestsStep1Modal } from "./InviteGuestsStep1Modal";
import { InviteGuestsStep2Modal } from "./InviteGuestsStep2Modal";
import { UpdateHostModal } from "./UpdateHostModal";

const MODAL_CONFIG: Record<
  Exclude<EventModalType, null>,
  { title: string; description?: string }
> = {
  "add-host": {
    title: "Add Host",
    description:
      "Add a host to highlight them on the event page or to get help managing the event.",
  },
  "configure-host": {
    title: "Configure Host",
  },
  "update-host": {
    title: "Update Host",
  },
  "add-sub-event": {
    title: "Add Sub-Event",
    description: "Add a day, session, or activity for your event.",
  },
  "invite-1": {
    title: "Invite Guests",
    description: "Send out invites and start building your guest list.",
  },
  "invite-2": {
    title: "Invite Guests",
    description: "Send out invites and start building your guest list.",
  },
};

export type { EventModalType, EventModalsProps } from "./types";

export function EventModals(props: EventModalsProps) {
  const { modal, onClose } = props;
  const open = modal !== null;

  if (!open) return null;

  const config = MODAL_CONFIG[modal];
  const title = config.title;
  const description = config.description;

  return (
    <Dialog
      open
      onOpenChange={(v) => !v && onClose()}
      title={title}
      description={description}
    >
      <EventModalContent modal={modal} {...props} onClose={onClose} />
    </Dialog>
  );
}

function EventModalContent({
  modal,
  onClose,
  ...p
}: EventModalsProps & { onClose: () => void }) {
  switch (modal) {
    case "add-host":
      return <AddHostModal onNext={p.onAddHostNext} />;
    case "configure-host":
      return (
        <ConfigureHostModal
          showOnPage={p.configureShowOnPage}
          onShowOnPageChange={p.setConfigureShowOnPage}
          isManager={p.configureIsManager}
          onIsManagerChange={p.setConfigureIsManager}
          onSendInvite={p.onSendHostInvite}
        />
      );
    case "update-host":
      return (
        <UpdateHostModal
          host={p.editingHost}
          showOnPage={p.updateShowOnPage}
          onShowOnPageChange={p.setUpdateShowOnPage}
          isManager={p.updateIsManager}
          onIsManagerChange={p.setUpdateIsManager}
          onUpdate={p.onUpdateHost}
          onRemove={() => {
            p.onRemoveHost();
            onClose();
          }}
        />
      );
    case "add-sub-event":
      return (
        <AddSubEventModal
          onNext={p.onAddSubEventNext}
          onClose={onClose}
        />
      );
    case "invite-1":
      return (
        <InviteGuestsStep1Modal
          inviteLink={p.inviteLink}
          emails={p.inviteEmails}
          onAddEmail={p.addInviteEmail}
          onRemoveEmail={p.removeInviteEmail}
          onNext={p.onInviteToStep2}
        />
      );
    case "invite-2":
      return (
        <InviteGuestsStep2Modal
          emails={p.inviteEmails}
          customMessage={p.inviteMessage}
          onCustomMessageChange={p.setInviteMessage}
          onBack={p.onInviteBack}
          onSendInvites={p.onSendInvites}
        />
      );
    default:
      return null;
  }
}
