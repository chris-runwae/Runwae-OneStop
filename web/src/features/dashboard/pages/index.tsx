import StatCard from '@/features/dashboard/components/StatCard'
import EventPerformanceChart from '@/features/dashboard/components/EventPerformanceChart'
import type { StatCardData } from '@/features/dashboard/types'

const stats: StatCardData[] = [
  { label: 'Views', value: '15,760', change: '+10.23% from last month', trend: 'up' },
  { label: 'Trip Plans', value: '456', change: '+10.23% from last month', trend: 'down' },
  { label: 'Bookings', value: '321', change: '+10.23% from last month', trend: 'up' },
  { label: 'Commission', value: '$34,056', change: '+10.23% from last month', trend: 'up' },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-10">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Chart */}
      <EventPerformanceChart />
    </div>
  )
}
