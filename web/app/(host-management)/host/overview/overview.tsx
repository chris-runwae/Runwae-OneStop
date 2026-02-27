import { EventMetrics, EventMetricsProps } from "./components/event-metrics";
import { EventPerformanceChart } from "./components/event-performance-chart";

const stats: EventMetricsProps[] = [
  {
    label: "Views",
    value: "15,760",
    change: "+10.23% from last month",
    trend: "up",
  },
  {
    label: "Trip Plans",
    value: "456",
    change: "+10.23% from last month",
    trend: "down",
  },
  {
    label: "Bookings",
    value: "321",
    change: "+10.23% from last month",
    trend: "up",
  },
  {
    label: "Commission",
    value: "$34,056",
    change: "+10.23% from last month",
    trend: "up",
  },
];

export default function Overview() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <EventMetrics key={stat.label} {...stat} />
        ))}
      </div>

      {/* Chart */}
      <EventPerformanceChart />
    </div>
  );
}
