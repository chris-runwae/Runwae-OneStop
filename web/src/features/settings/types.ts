import type { ComponentType, SVGProps } from 'react'

export interface SettingsTab {
  id: string
  label: string
}

export interface SocialMediaLink {
  id: string
  platform: string
  url: string
}

export interface PlatformOption {
  value: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}
