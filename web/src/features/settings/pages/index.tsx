import { useState } from 'react'
import SettingsTabNav from '@/features/settings/components/SettingsTabNav'
import ProfileTab from '@/features/settings/components/ProfileTab'
import type { SettingsTab } from '@/features/settings/types'

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'payment', label: 'Payment Settings' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security Settings' },
  { id: 'account', label: 'Account Settings' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="p-10">
      <h1 className="font-display text-4xl font-bold leading-[56px] text-heading">
        Settings
      </h1>

      <div className="mt-8 flex">
        {/* Tab navigation */}
        <SettingsTabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Vertical divider */}
        <div className="mx-10 w-px self-stretch bg-border" />

        {/* Tab content */}
        <div className="min-w-0 flex-1">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab !== 'profile' && (
            <p className="text-muted">Coming soon.</p>
          )}
        </div>
      </div>
    </div>
  )
}
