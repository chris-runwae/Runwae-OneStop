import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router'
import runwaeLogo from '@/assets/Runwae-Logo-Dark.png'
import avatar from '@/assets/avatar.png'
import DashboardIcon from '@/assets/icons/components/DashboardIcon'
import EventsIcon from '@/assets/icons/components/EventsIcon'
import BriefcaseIcon from '@/assets/icons/components/BriefcaseIcon'
import PayoutIcon from '@/assets/icons/components/PayoutIcon'
import PeopleIcon from '@/assets/icons/components/PeopleIcon'
import TeamIcon from '@/assets/icons/components/TeamIcon'
import GearIcon from '@/assets/icons/components/GearIcon'
import LogoutIcon from '@/assets/icons/components/LogoutIcon'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
  { to: '/', label: 'Overview', icon: DashboardIcon },
  { to: '/events', label: 'My Events', icon: EventsIcon },
  { to: '/earnings', label: 'Earnings', icon: BriefcaseIcon },
  { to: '/payouts', label: 'Payouts', icon: PayoutIcon },
  { to: '/attendee-insights', label: 'Attendee Insights', icon: PeopleIcon },
  { to: '/team-access', label: 'Team Access', icon: TeamIcon },
  { to: '/settings', label: 'Settings', icon: GearIcon },
]

export default function Sidebar() {
  return (
    <aside className="flex w-[284px] shrink-0 flex-col border-r border-border-light bg-surface">
      {/* Logo */}
      <div className="px-6 pt-6">
        <img src={runwaeLogo} alt="Runwae" className="h-[35px] w-auto" />
      </div>

      {/* Navigation */}
      <nav className="mt-[46px] flex flex-1 flex-col px-6">
        <ul className="flex flex-col gap-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-6 py-3.5 font-display text-base transition-colors ${
                    isActive
                      ? 'bg-heading font-semibold text-white'
                      : 'font-medium text-body hover:bg-border-light'
                  }`
                }
              >
                {({ isActive }) => {
                  const iconColor = isActive ? 'white' : '#343a40'
                  return (
                    <>
                      <item.icon
                        fill={iconColor}
                        stroke={iconColor}
                        width={20}
                        height={20}
                      />
                      {item.label}
                    </>
                  )
                }}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User card */}
        <div className="mt-auto mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface px-2 py-3">
          <div className="flex items-start gap-2">
            <img 
              src={avatar} 
              alt="User Avatar" 
              className="h-6 w-6 shrink-0 rounded-full object-cover" 
            />
            <div className="flex flex-col">
              <span className="font-display text-base font-bold leading-6 text-heading">
                James Lucy
              </span>
              <span className="text-sm leading-5 text-muted">
                jameslucy@gmail.com
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-error-light px-6 py-3.5">
            <LogoutIcon stroke="#f61801" width={20} height={20} />
            <span className="font-display text-base font-medium text-error">
              Logout
            </span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
