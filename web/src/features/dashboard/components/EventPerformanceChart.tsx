import ChevronDownIcon from '@/assets/icons/components/ChevronDownIcon'
import type { ChartBarData } from '@/features/dashboard/types'

const chartData: ChartBarData[] = [
  { month: 'Jan', value: 4700 },
  { month: 'Feb', value: 9100 },
  { month: 'Mar', value: 3500 },
  { month: 'Apr', value: 19400 },
  { month: 'May', value: 22800 },
  { month: 'Jun', value: 15600 },
  { month: 'Jul', value: 9500 },
  { month: 'Aug', value: 14400 },
  { month: 'Sep', value: 27000 },
  { month: 'Oct', value: 17700 },
  { month: 'Nov', value: 28500, highlighted: true },
  { month: 'Dec', value: 14400, faded: true },
]

const MAX_VALUE = 30000
const Y_TICKS = [0, 5000, 10000, 15000, 20000, 25000, 30000]

export default function EventPerformanceChart() {
  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-10 py-6">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-medium tracking-tight text-body">
            Event Performance
          </span>
          <span className="text-sm font-medium tracking-tight text-muted">
            Track how your event is growing across attendees, bookings, and trip
            plans.
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-base font-medium tracking-tight text-body">
          Events
          <ChevronDownIcon width={16} height={16} />
        </span>
      </div>

      {/* Chart */}
      <div className="flex px-10 pt-10 pb-8">
        {/* Y-axis */}
        <div className="flex w-14 shrink-0 flex-col-reverse justify-between pb-8 text-right text-sm font-medium text-black">
          {Y_TICKS.map((tick) => (
            <span key={tick}>{tick.toLocaleString()}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-end gap-2">
          {chartData.map((bar) => (
            <div
              key={bar.month}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <div className="flex h-[372px] w-full max-w-[62px] items-end self-center">
                <div
                  className={`w-full rounded-t-xl ${
                    bar.highlighted ? 'bg-primary' : 'bg-border'
                  } ${bar.faded ? 'opacity-40' : ''}`}
                  style={{
                    height: `${(bar.value / MAX_VALUE) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-black">
                {bar.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
