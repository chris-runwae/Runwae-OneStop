"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Lock,
  Mail,
  MapPin,
  Pencil,
  UserPlus,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type EventModalType, EventModals } from "./event-modals";

// Mock data – replace with real data from API
const mockEvent = {
  id: "1",
  name: "Afrobeat Fest",
  imageUrl: "/logo-dark.png",
  date: "Saturday, November 22, 2025",
  timeRange: "12:00PM - November 23, 12:00AM",
  location: "Landmark, Lagos Nigeria",
  address: "Plot 2 4 3, water cooperation road...",
  invitesAccepted: 20,
  invitesSent: 300,
  hosts: [
    { name: "Emmanualla James", email: "jamesella@gmail.com", role: "CREATOR" },
    { name: "John Donald", email: "johndonald@gmail.com", role: "MANAGER" },
  ],
  subEvents: [
    { name: "Welcome Dinner", day: "DAY 1", date: "20-12-2025" },
    { name: "Beach Day", day: "DAY 2", date: "20-12-2025" },
  ],
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "guests", label: "Guests" },
  { id: "bookings", label: "Bookings" },
  { id: "faqs", label: "FAQs" },
] as const;

export default function EventOverview({ eventId }: { eventId: string }) {
  const event = mockEvent;

  // Single source of truth: which modal is open (null = none)
  const [activeModal, setActiveModal] = useState<EventModalType>(null);

  // Data for each modal (used when that modal is open)
  const [pendingHost, setPendingHost] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [configureShowOnPage, setConfigureShowOnPage] = useState(true);
  const [configureIsManager, setConfigureIsManager] = useState(true);

  const [editingHost, setEditingHost] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [updateShowOnPage, setUpdateShowOnPage] = useState(true);
  const [updateIsManager, setUpdateIsManager] = useState(true);

  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const inviteLink = "invitemeworoldofheroes/invite.com";

  const closeModal = () => setActiveModal(null);

  // Add Host: open modal
  const openAddHost = () => setActiveModal("add-host");

  // Add Host Next → switch to Configure Host with pending host data
  const onAddHostNext = (name: string, email: string) => {
    setPendingHost({ name, email });
    setConfigureShowOnPage(true);
    setConfigureIsManager(true);
    setActiveModal("configure-host");
  };

  const onSendHostInvite = () => {
    setPendingHost(null);
    closeModal();
  };

  // Update Host: open with selected host, reset toggles to defaults
  const openUpdateHost = (host: { name: string; email: string }) => {
    setEditingHost(host);
    setUpdateShowOnPage(true);
    setUpdateIsManager(true);
    setActiveModal("update-host");
  };

  const onUpdateHost = () => closeModal();
  const onRemoveHost = () => {
    setEditingHost(null);
    closeModal();
  };

  // Add Sub-Event
  const openAddSubEvent = () => setActiveModal("add-sub-event");
  const onAddSubEventNext = () => closeModal();

  // Invite Guests
  const openInviteGuests = () => {
    setInviteEmails([]);
    setInviteMessage("");
    setActiveModal("invite-1");
  };
  const addInviteEmail = (email: string) => {
    if (!inviteEmails.includes(email))
      setInviteEmails((prev) => [...prev, email]);
  };
  const removeInviteEmail = (email: string) =>
    setInviteEmails((prev) => prev.filter((e) => e !== email));
  const onInviteToStep2 = () => setActiveModal("invite-2");
  const onInviteBack = () => setActiveModal("invite-1");
  const onSendInvites = () => closeModal();

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
      {/* Event title + tabs */}
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-bold text-black sm:text-3xl">
          {event.name}
        </h1>
        <nav className="flex gap-6 border-b border-border">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/events/${eventId}/${tab.id === "overview" ? "" : tab.id}`}
              className={cn(
                "relative pb-3 font-display text-sm font-medium transition-colors",
                tab.id === "overview"
                  ? "text-black"
                  : "text-muted-foreground hover:text-body"
              )}
            >
              {tab.label}
              {tab.id === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Event details card: image + date + location */}
      <div className="grid gap-4 lg:grid-cols-[1fr,minmax(280px,360px)]">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border bg-muted/30 sm:aspect-2/1">
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90"
            aria-label="Refresh or change image"
          >
            <Lock className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <Calendar className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-body">{event.date}</p>
                <p className="text-sm text-muted-foreground">
                  {event.timeRange}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <MapPin className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-body">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.address}</p>
                <div className="mt-2 h-16 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Map preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Event / Edit Event */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "gap-2"
          )}
        >
          Share Event
        </button>
        <Link
          href={`/events/${eventId}/edit`}
          className={cn(buttonVariants({ variant: "primary", size: "default" }))}
        >
          Edit Event
        </Link>
      </div>

      {/* Invites */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-black">
              Invites
            </h2>
            <p className="text-sm text-muted-foreground">
              Invite contacts and guests via email address. Invites will be sent
              to their email.
            </p>
          </div>
          <button
            type="button"
            onClick={openInviteGuests}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-2 flex w-fit gap-2 sm:mt-0"
            )}
          >
            <UserPlus className="size-4" />
            Invite Guests
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <Mail className="size-5 text-destructive" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-black">
                {event.invitesAccepted}
              </p>
              <p className="text-sm text-muted-foreground">
                Invites Accepted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-black">
                {event.invitesSent}
              </p>
              <p className="text-sm text-muted-foreground">Invites Sent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hosts */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-black">
              Hosts
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage who has access to your event controls.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddHost}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-2 flex w-fit gap-2 sm:mt-0"
            )}
          >
            <UserPlus className="size-4" />
            Add Host
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {event.hosts.map((host) => (
            <div
              key={host.email}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {host.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-body">{host.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {host.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                    host.role === "CREATOR"
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  )}
                >
                  {host.role}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openUpdateHost({ name: host.name, email: host.email })}
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-body"
                aria-label="Edit host"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sub Events */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-black">
              Sub Events
            </h2>
            <p className="text-sm text-muted-foreground">
              Build out your event schedule, one sub-event at a time.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddSubEvent}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-2 flex w-fit gap-2 sm:mt-0"
            )}
          >
            <UserPlus className="size-4" />
            Add Sub Event
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {event.subEvents.map((sub) => (
            <div
              key={sub.name}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <p className="font-medium text-body">{sub.name}</p>
                <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {sub.day}
                </span>
                <span className="text-sm text-muted-foreground">{sub.date}</span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-body"
                aria-label="Edit sub event"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Visibility & Discovery */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-black">
              Visibility & Discovery
            </h2>
            <p className="text-sm text-muted-foreground">
              Control how people can find your event.
            </p>
          </div>
          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-2 flex w-fit gap-2 sm:mt-0"
            )}
          >
            <Eye className="size-4" />
            Change Visibility
          </button>
        </div>
      </section>

      {/* Single modals container: one dialog, content by activeModal */}
      <EventModals
        modal={activeModal}
        onClose={closeModal}
        onAddHostNext={onAddHostNext}
        pendingHost={pendingHost}
        configureShowOnPage={configureShowOnPage}
        setConfigureShowOnPage={setConfigureShowOnPage}
        configureIsManager={configureIsManager}
        setConfigureIsManager={setConfigureIsManager}
        onSendHostInvite={onSendHostInvite}
        editingHost={editingHost}
        updateShowOnPage={updateShowOnPage}
        setUpdateShowOnPage={setUpdateShowOnPage}
        updateIsManager={updateIsManager}
        setUpdateIsManager={setUpdateIsManager}
        onUpdateHost={onUpdateHost}
        onRemoveHost={onRemoveHost}
        onAddSubEventNext={onAddSubEventNext}
        inviteLink={inviteLink}
        inviteEmails={inviteEmails}
        addInviteEmail={addInviteEmail}
        removeInviteEmail={removeInviteEmail}
        inviteMessage={inviteMessage}
        setInviteMessage={setInviteMessage}
        onInviteToStep2={onInviteToStep2}
        onInviteBack={onInviteBack}
        onSendInvites={onSendInvites}
      />
    </div>
  );
}
