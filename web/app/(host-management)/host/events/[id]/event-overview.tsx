"use client";

import { ROUTES, eventEdit } from "@/app/routes";
import { GoogleMapPreview } from "@/components/shared/google-map-preview";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { getUserDisplayInfo } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { shareLink } from "@/lib/share";
import {
  deleteEventHost,
  getEventDetailForOwner,
  insertEventHost,
  insertEventSubEvent,
  updateEventHost,
} from "@/lib/supabase/events";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Eye,
  Lock,
  Mail,
  MapPin,
  Pencil,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { type EventModalType, EventModals } from "./event-modals";
import type { HostInfo } from "./event-modals/types";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "guests", label: "Guests" },
  { id: "bookings", label: "Bookings" },
  { id: "faqs", label: "FAQs" },
] as const;

const PLACEHOLDER_IMAGE = "/logo-dark.png";

function formatEventDateLine(date: string | null, time: string | null): string {
  if (!date) return "—";
  const t = (time?.trim() || "00:00").slice(0, 5);
  try {
    return format(new Date(`${date}T${t}`), "EEEE, MMMM d, yyyy");
  } catch {
    return date;
  }
}

function formatEventTimeRange(
  startDate: string | null,
  startTime: string | null,
  endDate: string | null,
  endTime: string | null,
): string {
  if (!startDate) return "—";
  const st = (startTime?.trim() || "00:00").slice(0, 5);
  const ed = endDate || startDate;
  const et = (endTime?.trim() || "23:59").slice(0, 5);
  try {
    const start = new Date(`${startDate}T${st}`);
    const end = new Date(`${ed}T${et}`);
    return `${format(start, "h:mm a")} – ${format(end, "h:mm a, MMM d, yyyy")}`;
  } catch {
    return "—";
  }
}

function subEventDayLabel(
  eventStartDate: string | null,
  subStartsAt: string | null,
): string | null {
  if (!eventStartDate || !subStartsAt) return null;
  try {
    const start = new Date(eventStartDate);
    const sub = new Date(subStartsAt);
    start.setHours(0, 0, 0, 0);
    sub.setHours(0, 0, 0, 0);
    const diff = Math.round(
      (sub.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (diff < 0) return null;
    return `DAY ${diff + 1}`;
  } catch {
    return null;
  }
}

export default function EventOverview({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [activeModal, setActiveModal] = useState<EventModalType>(null);

  const [pendingHost, setPendingHost] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [configureShowOnPage, setConfigureShowOnPage] = useState(true);
  const [configureIsManager, setConfigureIsManager] = useState(true);

  const [editingHost, setEditingHost] = useState<HostInfo | null>(null);
  const [updateShowOnPage, setUpdateShowOnPage] = useState(true);
  const [updateIsManager, setUpdateIsManager] = useState(true);

  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const inviteLink = detail?.slug
    ? `${window.location.origin}/events/${detail.slug}`
    : "";

  const {
    data: detail,
    isPending,
    error,
  } = useQuery({
    queryKey: ["event-detail", eventId, user?.id],
    queryFn: () => getEventDetailForOwner(eventId, user!.id),
    enabled: !!user,
  });

  const closeModal = () => setActiveModal(null);

  const invalidateDetail = () =>
    queryClient.invalidateQueries({
      queryKey: ["event-detail", eventId, user?.id],
    });

  const openAddHost = () => setActiveModal("add-host");

  const onAddHostNext = (name: string, email: string) => {
    setPendingHost({ name, email });
    setConfigureShowOnPage(true);
    setConfigureIsManager(true);
    setActiveModal("configure-host");
  };

  const onSendHostInvite = async () => {
    if (!pendingHost) return;
    try {
      await insertEventHost({
        event_id: eventId,
        name: pendingHost.name,
        email: pendingHost.email,
        show_on_page: configureShowOnPage,
        is_manager: configureIsManager,
      });
      await invalidateDetail();
      setPendingHost(null);
      closeModal();
      toast.success("Host added.");
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not add host. If this persists, apply the event_hosts migration in Supabase.",
      );
    }
  };

  const openUpdateHost = (host: HostInfo) => {
    setEditingHost(host);
    const row = detail?.event_hosts.find((h) => h.id === host.id);
    setUpdateShowOnPage(row?.show_on_page ?? true);
    setUpdateIsManager(row?.is_manager ?? true);
    setActiveModal("update-host");
  };

  const onUpdateHost = async () => {
    if (!editingHost) return;
    try {
      await updateEventHost(editingHost.id, {
        show_on_page: updateShowOnPage,
        is_manager: updateIsManager,
      });
      await invalidateDetail();
      setEditingHost(null);
      closeModal();
      toast.success("Host updated.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not update host.");
    }
  };

  const onRemoveHost = async () => {
    if (!editingHost) return;
    try {
      await deleteEventHost(editingHost.id);
      await invalidateDetail();
      setEditingHost(null);
      toast.success("Host removed.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not remove host.");
    }
  };

  const openAddSubEvent = () => setActiveModal("add-sub-event");
  const onAddSubEventNext = async (name: string, dateTime: string) => {
    try {
      const startsAt = new Date(dateTime).toISOString();
      await insertEventSubEvent({
        event_id: eventId,
        name,
        starts_at: startsAt,
      });
      await invalidateDetail();
      toast.success("Sub-event added.");
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not add sub-event. Apply the event_sub_events migration if needed.",
      );
      throw e;
    }
  };

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

  if (authLoading || !user) return null;

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "We couldn’t load this event."}
        </p>
        <Link
          href={ROUTES.host.events}
          className={cn(
            buttonVariants({ variant: "primary", size: "default" }),
          )}
        >
          Back to events
        </Link>
      </div>
    );
  }

  const { fullName: creatorName } = getUserDisplayInfo(user);

  const coHostRows = detail.event_hosts.map((h) => ({
    key: h.id,
    name: h.name,
    email: h.email,
    role: h.is_manager ? ("MANAGER" as const) : ("HOST" as const),
    hostInfo: { id: h.id, name: h.name, email: h.email } satisfies HostInfo,
  }));

  const bannerSrc = detail.image?.trim() || PLACEHOLDER_IMAGE;
  const locationPrimary = detail.location?.trim() || "—";
  const descriptionSnippet =
    detail.description?.trim().split("\n")[0]?.slice(0, 120) || "";

  return (
    <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-2xl font-bold text-black sm:text-3xl">
          {detail.name}
        </h1>
        <nav className="flex gap-6 border-b border-border">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`${ROUTES.host.events}/${eventId}${tab.id === "overview" ? "" : `/${tab.id}`}`}
              className={cn(
                "relative pb-3 font-display text-sm font-medium transition-colors",
                tab.id === "overview"
                  ? "text-black"
                  : "text-muted-foreground hover:text-body",
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

      <div className="grid gap-4 lg:grid-cols-[1fr,minmax(280px,360px)]">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border bg-muted/30 sm:aspect-2/1">
          <Image
            src={bannerSrc}
            alt={detail.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
            unoptimized={
              bannerSrc.startsWith("http://") ||
              bannerSrc.startsWith("https://")
            }
            loading="eager"
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
            {/* date & time */}
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <Calendar className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-body">
                  {formatEventDateLine(detail.start_date, detail.start_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatEventTimeRange(
                    detail.start_date,
                    detail.start_time,
                    detail.end_date,
                    detail.end_time,
                  )}
                </p>
              </div>
            </div>
            {/* location */}
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <MapPin className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-body">{locationPrimary}</p>
                {descriptionSnippet ? (
                  <p className="text-sm text-muted-foreground">
                    {descriptionSnippet}
                    {detail.description && detail.description.length > 120
                      ? "…"
                      : ""}
                  </p>
                ) : null}
                <GoogleMapPreview
                  latitude={detail.latitude}
                  longitude={detail.longitude}
                  className="mt-2 border border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={"outline"}
          onClick={() =>
            shareLink(
              `${window.location.origin}/events/${detail.slug}`,
              detail.name,
            )
          }
        >
          Share Event
        </Button>
        <Link
          href={eventEdit(eventId)}
          className={cn(
            buttonVariants({ variant: "primary", size: "default" }),
          )}
        >
          Edit Event
        </Link>
      </div>

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
              "mt-2 flex w-fit gap-2 sm:mt-0",
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
              <p className="font-display text-2xl font-bold text-black">0</p>
              <p className="text-sm text-muted-foreground">Invites Accepted</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-black">0</p>
              <p className="text-sm text-muted-foreground">Invites Sent</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-black">Hosts</h2>
            <p className="text-sm text-muted-foreground">
              Manage who has access to your event controls.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddHost}
            className={cn(
              buttonVariants({ variant: "outline", size: "default" }),
              "mt-2 flex w-fit gap-2 sm:mt-0",
            )}
          >
            <UserPlus className="size-4" />
            Add Host
          </button>
        </div>
        {coHostRows.length > 0 ? (
          <div className="flex flex-col gap-2">
            {coHostRows.map((host) => (
              <div
                key={host.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {host.name
                        .split(" ")
                        .filter(Boolean)
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
                      host.role === "MANAGER"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {host.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openUpdateHost(host.hostInfo)}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-body"
                  aria-label="Edit host"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

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
              "mt-2 flex w-fit gap-2 sm:mt-0",
            )}
          >
            <UserPlus className="size-4" />
            Add Sub Event
          </button>
        </div>
        {detail.event_sub_events.length > 0 ? (
          <div className="flex flex-col gap-2">
            {detail.event_sub_events.map((sub) => {
              const day = subEventDayLabel(detail.start_date, sub.starts_at);
              const dateLabel = sub.starts_at
                ? formatDate(sub.starts_at).date +
                  " · " +
                  formatDate(sub.starts_at).time
                : "—";
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4"
                >
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                    <p className="font-medium text-body">{sub.name}</p>
                    {day ? (
                      <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {day}
                      </span>
                    ) : null}
                    <span className="text-sm text-muted-foreground">
                      {dateLabel}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-body"
                    aria-label="Edit sub event"
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

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
              "mt-2 flex w-fit gap-2 sm:mt-0",
            )}
          >
            <Eye className="size-4" />
            Change Visibility
          </button>
        </div>
      </section>

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
