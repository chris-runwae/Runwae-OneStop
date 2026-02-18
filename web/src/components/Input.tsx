import type { ComponentType, InputHTMLAttributes, ReactNode, SVGProps } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  prefix?: ReactNode
  suffix?: ReactNode
}

export default function Input({ icon: Icon, prefix, suffix, className, ...rest }: InputProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-4 ${className ?? ''}`}
    >
      {prefix}
      {Icon && <Icon width={16} height={16} className="shrink-0 text-muted" />}
      <input
        className="min-w-0 flex-1 bg-transparent text-xs text-body placeholder:text-muted outline-none"
        {...rest}
      />
      {suffix}
    </div>
  )
}
