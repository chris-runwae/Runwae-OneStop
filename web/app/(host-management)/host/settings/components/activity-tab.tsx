"use client";

import {
  CalendarPlus,
  LogIn,
  UserPen,
  type LucideIcon,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "login" | "profile" | "event";
  title: string;
  description: string;
  timestamp: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "login",
    title: "Login Successful",
    description: "IP Address: 192.168.1.1",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "profile",
    title: "Profile Updated",
    description: "Changed profile information",
    timestamp: "2 hours ago",
  },
  {
    id: "3",
    type: "event",
    title: "Event Created",
    description: 'Created "Tech Summit 2026"',
    timestamp: "2 hours ago",
  },
];

const typeConfig: Record<
  ActivityItem["type"],
  { icon: LucideIcon; iconBg: string; iconColor: string }
> = {
  login: {
    icon: LogIn,
    iconBg: "bg-blue-500",
    iconColor: "text-white",
  },
  profile: {
    icon: UserPen,
    iconBg: "bg-sky-400",
    iconColor: "text-white",
  },
  event: {
    icon: CalendarPlus,
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
  },
};

function ActivityCard({ item }: { item: ActivityItem }) {
  const { icon: Icon, iconBg, iconColor } = typeConfig[item.type];

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:gap-5 sm:rounded-2xl sm:p-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 ${iconBg} ${iconColor}`}
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold text-heading sm:text-lg">
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">
          {item.description}
        </p>
      </div>
      <p className="shrink-0 text-sm font-medium text-muted-foreground">
        {item.timestamp}
      </p>
    </div>
  );
}

export default function ActivityTab() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Activity
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Recent activity on your account.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {ACTIVITIES.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
