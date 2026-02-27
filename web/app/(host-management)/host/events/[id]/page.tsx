import EventOverview from "./event-overview";

export default async function EventManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventOverview eventId={id} />;
}
