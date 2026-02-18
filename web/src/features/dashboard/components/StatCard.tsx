import ChevronDownIcon from '@/assets/icons/components/ChevronDownIcon'
import TrendArrowIcon from '@/assets/icons/components/TrendArrowIcon'
import type { StatCardData } from '@/features/dashboard/types'

export default function StatCard({ label, value, change, trend }: StatCardData) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-sm font-medium tracking-tight text-body">
          {label}
        </span>
        <span className="flex items-center gap-1 rounded bg-badge px-2 py-1.5 text-xs font-medium tracking-tight text-body">
          This month
          <ChevronDownIcon />
        </span>
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-4">
        <p className="font-display text-[32px] font-semibold leading-10 text-black">
          {value}
        </p>
        <div className="mt-3 flex items-center gap-1">
          <TrendArrowIcon
            direction={trend}
            fill={trend === 'up' ? '#00c864' : '#f61801'}
          />
          <span
            className={`text-sm font-semibold ${
              trend === 'up' ? 'text-success' : 'text-error'
            }`}
          >
            {change}
          </span>
        </div>
      </div>
    </div>
  )
}
