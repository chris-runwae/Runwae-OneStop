export interface StatCardData {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
}

export interface ChartBarData {
  month: string
  value: number
  highlighted?: boolean
  faded?: boolean
}
