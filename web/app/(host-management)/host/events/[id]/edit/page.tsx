"use client";

import CreateEvent from "../../create/create-event";
import { useParams } from "next/navigation";

export default function EditEventPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  if (!id) return null;
  return <CreateEvent editEventId={id} />;
}
