export type EventModalType =
  | null
  | "add-host"
  | "configure-host"
  | "update-host"
  | "add-sub-event"
  | "invite-1"
  | "invite-2";

export interface HostInfo {
  name: string;
  email: string;
}

export interface EventModalsProps {
  modal: EventModalType;
  onClose: () => void;
  onAddHostNext: (name: string, email: string) => void;
  pendingHost: HostInfo | null;
  configureShowOnPage: boolean;
  setConfigureShowOnPage: (v: boolean) => void;
  configureIsManager: boolean;
  setConfigureIsManager: (v: boolean) => void;
  onSendHostInvite: () => void;
  editingHost: HostInfo | null;
  updateShowOnPage: boolean;
  setUpdateShowOnPage: (v: boolean) => void;
  updateIsManager: boolean;
  setUpdateIsManager: (v: boolean) => void;
  onUpdateHost: () => void;
  onRemoveHost: () => void;
  onAddSubEventNext: (name: string, dateTime: string) => void;
  inviteLink: string;
  inviteEmails: string[];
  addInviteEmail: (email: string) => void;
  removeInviteEmail: (email: string) => void;
  inviteMessage: string;
  setInviteMessage: (v: string) => void;
  onInviteToStep2: () => void;
  onInviteBack: () => void;
  onSendInvites: () => void;
}
