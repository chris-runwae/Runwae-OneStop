"use client";

import { Button } from "@/components/ui/button";
import { Copy, DollarSign, Settings } from "lucide-react";
import { useState } from "react";

interface PaymentAccount {
  id: string;
  email: string;
  currency: string;
  currencyLabel: string;
}

const defaultAccounts: PaymentAccount[] = [
  {
    id: "1",
    email: "ella@domain.com",
    currency: "USD",
    currencyLabel: "USD Dollar",
  },
  {
    id: "2",
    email: "ella@domain.com",
    currency: "USD",
    currencyLabel: "USD Dollar",
  },
];

function PaymentAccountCard({
  account,
  onManage,
}: {
  account: PaymentAccount;
  onManage: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(account.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <p className="text-sm font-medium text-muted-foreground">Connected as</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="truncate font-display text-base font-semibold text-heading sm:text-lg">
          {account.email}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-badge hover:text-body focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={copied ? "Copied" : "Copy email"}
          title={copied ? "Copied" : "Copy email"}
        >
          <Copy className="size-4" aria-hidden />
        </button>
      </div>
      {copied && (
        <span className="mt-0.5 text-xs font-medium text-success">Copied</span>
      )}
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Currency
      </p>
      <div className="mt-1 flex items-center gap-2">
        <DollarSign
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="font-display text-base font-semibold text-heading sm:text-lg">
          {account.currencyLabel}
        </span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="mt-5 w-full sm:mt-6 sm:w-auto"
        onClick={() => onManage(account.id)}
      >
        <Settings className="size-4 shrink-0" aria-hidden />
        Manage Account
      </Button>
    </div>
  );
}

export default function PaymentSettingsTab() {
  const handleManage = (id: string) => {
    // TODO: navigate to manage flow or open modal
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-black sm:text-2xl">
          Payment Settings
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Manage your connected payment accounts and payout preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {defaultAccounts.map((account) => (
          <PaymentAccountCard
            key={account.id}
            account={account}
            onManage={handleManage}
          />
        ))}
      </div>
    </div>
  );
}
