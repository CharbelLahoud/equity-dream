import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";

import { StatCard } from "@/components/app-shell";
import { getWalletBalance } from "@/services/wallet.service";

export function DashboardWalletCard() {
  const {
    data: wallet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: getWalletBalance,
  });

  let displayedValue = "$0.00";
  let displayedHint = "Available to trade";

  if (isLoading) {
    displayedValue = "Loading...";
    displayedHint = "Loading Wallet balance";
  }

  if (isError) {
    displayedValue = "Unavailable";
    displayedHint = "Could not load Wallet balance";
  }

  if (!isLoading && !isError) {
    displayedValue = formatCurrency(wallet?.balance ?? 0);
  }

  return (
    <StatCard
      label="Wallet Balance"
      value={displayedValue}
      hint={displayedHint}
      icon={DollarSign}
    />
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}
