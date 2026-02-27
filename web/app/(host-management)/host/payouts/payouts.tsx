"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  BanknoteIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  SearchIcon,
  WalletIcon,
} from "lucide-react";

const summaryCards = [
  {
    label: "Available Revenue",
    value: "$6,960",
    subtitle: "Ready for payout",
  },
  {
    label: "RWX Balance",
    value: "1,456 RWX",
    subtitle: "Earned via bookings",
  },
  {
    label: "Pending payouts",
    value: "$370",
    subtitle: "In processing",
  },
];

const periodOptions = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
];

type PayoutType = "Fiat" | "RWX";
type PayoutMethod = "Stripe" | "RWX wallet";

const payoutRows = [
  {
    id: "RW-PO-928301",
    date: "Oct 14, 2026",
    type: "Fiat" as PayoutType,
    method: "Stripe" as PayoutMethod,
    amount: "$560.00",
    status: "PAID" as const,
  },
  {
    id: "RW-PO-928301",
    date: "Oct 14, 2026",
    type: "RWX" as PayoutType,
    method: "RWX wallet" as PayoutMethod,
    amount: "$560.00",
    status: "PAID" as const,
  },
  {
    id: "RW-PO-928301",
    date: "Oct 14, 2026",
    type: "Fiat" as PayoutType,
    method: "Stripe" as PayoutMethod,
    amount: "$560.00",
    status: "PAID" as const,
  },
  {
    id: "RW-PO-928301",
    date: "Oct 14, 2026",
    type: "RWX" as PayoutType,
    method: "RWX wallet" as PayoutMethod,
    amount: "$560.00",
    status: "PAID" as const,
  },
];

function PayoutTypeCell({ type }: { type: PayoutType }) {
  return (
    <div className="flex items-center gap-2">
      {type === "Fiat" ? (
        <BanknoteIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
          RWX
        </span>
      )}
      <span className="font-medium text-body">{type}</span>
    </div>
  );
}

function PayoutMethodCell({ method }: { method: PayoutMethod }) {
  return (
    <div className="flex items-center gap-2">
      {method === "Stripe" ? (
        <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-body">
          $
        </span>
      ) : (
        <WalletIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className="font-medium text-body">{method}</span>
    </div>
  );
}

export default function Payouts() {
  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="text-sm font-medium tracking-tight text-body">
                {card.label}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 rounded bg-badge px-2 py-1.5 text-xs font-medium tracking-tight text-body transition-colors hover:bg-badge/80 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    This month
                    <ChevronDownIcon className="size-3.5" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {periodOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => {}}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="px-6 py-5">
              <p className="font-display text-[32px] font-semibold leading-10 text-black">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Payout History */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
                Payout History
              </h2>
              <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                Each row represents a booking that you earned a commission.
              </p>
            </div>
            <Button variant="primary" size="default" className="shrink-0">
              Withdraw Funds
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <SearchIcon
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search events"
                className="pl-9"
                aria-label="Search events"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  All Events
                  <ChevronDownIcon className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  All Events
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Upcoming
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Past Events
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <CalendarIcon className="size-4" aria-hidden />
                  Last 30 days
                  <ChevronDownIcon className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Last 90 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-border-disabled px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-disabled/80 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  All Status
                  <ChevronDownIcon className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                  Paid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <DownloadIcon className="size-4" aria-hidden />
              Download CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-badge/50">
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Payout ID
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Date
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Payout Type
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Payout method
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Amount
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Status
                </th>
                <th className="px-6 py-4 font-display font-semibold text-heading lg:px-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payoutRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-badge/30"
                >
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <PayoutTypeCell type={row.type} />
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <PayoutMethodCell method={row.method} />
                  </td>
                  <td className="px-6 py-4 font-medium text-body lg:px-10">
                    {row.amount}
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <span className="inline-flex rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 lg:px-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-badge hover:text-body focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label="Open payout actions"
                        >
                          <MoreHorizontalIcon className="size-4" aria-hidden />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[160px]">
                        <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {}} className="cursor-pointer">
                          Download receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
