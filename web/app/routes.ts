export const ROUTES = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  confirmOtp: "/confirm-otp",
  verifyAccount: "/verify-account",
  resetPassword: "/reset-password",
  host: {
    overview: "/host/overview",
    events: "/host/events",
    eventsCreate: "/host/events/create",
    bookings: "/host/bookings",
    earnings: "/host/earnings",
    payouts: "/host/payouts",
    attendeeInsights: "/host/attendee-insights",
    teamAccess: "/host/team-access",
    settings: "/host/settings",
  },
};

/** Build event detail URL: /host/events/[id] */
export function eventDetail(id: string) {
  return `${ROUTES.host.events}/${id}`;
}

/** Build event edit URL: /host/events/[id]/edit */
export function eventEdit(id: string) {
  return `${ROUTES.host.events}/${id}/edit`;
}

/** Open create flow with an event prefilled as a duplicate */
export function eventDuplicateHref(id: string) {
  return `${ROUTES.host.eventsCreate}?duplicate=${encodeURIComponent(id)}`;
}
