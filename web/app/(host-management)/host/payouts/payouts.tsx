"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BanknoteIcon,
  CalendarIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  WalletIcon,
} from "lucide-react";
import { FilterDropdown } from "../components/filter-dropdown";
import { SearchInput } from "../components/search-input";

const SUMMARY_CARDS = [
  { label: "Available Revenue", value: "$6,960", subtitle: "Ready for payout" },
  { label: "RWX Balance", value: "1,456 RWX", subtitle: "Earned via bookings" },
  { label: "Pending payouts", value: "$370", subtitle: "In processing" },
];

const PERIOD_OPTIONS = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
];

const EVENT_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

const DATE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
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

const tableHeader =
  "px-4 py-3 font-display font-semibold text-heading sm:px-6 lg:px-10 lg:py-4";
const tableCell =
  "px-4 py-3 font-medium text-body sm:px-6 lg:px-10 lg:py-4";

export default function Payouts() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:p-10">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
              <span className="text-sm font-medium tracking-tight text-body">
                {card.label}
              </span>
              <FilterDropdown
                label="This month"
                options={PERIOD_OPTIONS}
                minWidth="min-w-[140px]"
                triggerClassName="flex cursor-pointer items-center gap-1 rounded bg-badge px-2 py-1.5 text-xs font-medium tracking-tight text-body transition-colors hover:bg-badge/80 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <p className="font-display text-2xl font-semibold leading-tight text-black sm:text-[32px] sm:leading-10">
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
      <div className="overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl">
        <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-heading">
                Payout History
              </h2>
              <p className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                Each row represents a booking that you earned a commission.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <SearchInput
                placeholder="Search events"
                aria-label="Search events"
                className="w-full sm:w-auto"
              />
              <FilterDropdown label="All Events" options={EVENT_OPTIONS} />
              <FilterDropdown
                label="Last 30 days"
                options={DATE_OPTIONS}
                icon={CalendarIcon}
              />
              <FilterDropdown label="All Status" options={STATUS_OPTIONS} />
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium tracking-tight text-body transition-colors hover:bg-border-light focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <DownloadIcon className="size-4" aria-hidden />
                Download CSV
              </button>
              <Button variant="primary" size="default" className="ml-auto w-full shrink-0 sm:w-auto">
                Withdraw Funds
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-badge/50">
                <th className={tableHeader}>Payout ID</th>
                <th className={tableHeader}>Date</th>
                <th className={tableHeader}>Payout Type</th>
                <th className={tableHeader}>Payout method</th>
                <th className={tableHeader}>Amount</th>
                <th className={tableHeader}>Status</th>
                <th className={tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payoutRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-badge/30"
                >
                  <td className={tableCell}>{row.id}</td>
                  <td className={tableCell}>{row.date}</td>
                  <td className={tableCell}>
                    <PayoutTypeCell type={row.type} />
                  </td>
                  <td className={tableCell}>
                    <PayoutMethodCell method={row.method} />
                  </td>
                  <td className={tableCell}>{row.amount}</td>
                  <td className={tableCell}>
                    <span className="inline-flex rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                      {row.status}
                    </span>
                  </td>
                  <td className={tableCell}>
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
