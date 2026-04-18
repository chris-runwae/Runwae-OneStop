"use client";

import { useParams } from "next/navigation";
import CreateEvent from "@/app/(host-management)/host/events/create/create-event";

export default function AdminEditEventPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  if (!id) return null;
  return <CreateEvent editEventId={id} adminMode />;
}
