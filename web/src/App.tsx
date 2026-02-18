import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from '@/components/Layout'
import DashboardPage from '@/features/dashboard/pages'
import EventsPage from '@/features/events/pages'
import EarningsPage from '@/features/earnings/pages'
import PayoutsPage from '@/features/payouts/pages'
import AttendeeInsightsPage from '@/features/attendee-insights/pages'
import TeamAccessPage from '@/features/team-access/pages'
import SettingsPage from '@/features/settings/pages'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/earnings', element: <EarningsPage /> },
      { path: '/payouts', element: <PayoutsPage /> },
      { path: '/attendee-insights', element: <AttendeeInsightsPage /> },
      { path: '/team-access', element: <TeamAccessPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
