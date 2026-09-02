import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Receipt, RefreshCw } from "lucide-react";

import {
  getTransactions,
  getStock,
  getOrder,
  type Transaction,
  type TransactionType,
} from "@/services/transactions.service";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions · Meridian Trading" },
      {
        name: "description",
        content: "Complete history of your trades, deposits and withdrawals.",
      },
      { property: "og:title", content: "Transactions · Meridian" },
      {
        property: "og:description",
        content: "Search and filter your transaction history.",
      },
    ],
  }),
  component: TransactionsPage,
});

type TypeFilter = "all" | TransactionType;
type DaysFilter = "7" | "30" | "90" | "all";

function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("30");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const {
    data: transactionsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transactions", typeFilter, daysFilter],
    queryFn: () =>
      getTransactions({
        type: typeFilter === "all" ? undefined : typeFilter,
        days: daysFilter === "all" ? undefined : Number(daysFilter),
      }),
    retry: false,
  });

  const transactions: Transaction[] = Array.isArray(transactionsResponse)
    ? transactionsResponse
    : [];

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedSearch) return transactions;

    return transactions.filter((t) => {
      const stock = getStock(t);
      return (
        t._id.toLowerCase().includes(normalizedSearch) ||
        (stock?.ticker ?? "").toLowerCase().includes(normalizedSearch) ||
        (t.description ?? "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [transactions, normalizedSearch]);

  return (
    <AppShell
      title="Transactions"
      subtitle="Complete log of trades, deposits and withdrawals."
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All transactions</CardTitle>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, symbol, description..."
                  className="h-9 w-56 pl-9"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as TypeFilter)}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                  <SelectItem value="DEPOSIT">Deposit</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                  <SelectItem value="MANUAL_ADJUSTMENT">
                    Adjustment
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={daysFilter}
                onValueChange={(v) => setDaysFilter(v as DaysFilter)}
              >
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => void refetch()}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <StatePanel text="Loading transactions..." />
          ) : isError ? (
            <StatePanel
              text="Unable to load transactions."
              error
              action={
                <Button variant="outline" onClick={() => void refetch()}>
                  Try again
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <StatePanel text="No transactions in this range yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Type</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Shares
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((t) => {
                    const stock = getStock(t);
                    const order = getOrder(t);
                    const isInflow =
                      t.type === "SELL" || t.type === "DEPOSIT";
                    const isOutflow =
                      t.type === "BUY" || t.type === "WITHDRAWAL";

                    return (
                      <tr key={t._id} className="border-t hover:bg-muted/30">
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                          #{t._id.slice(-6).toUpperCase()}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(t.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <TypeBadge type={t.type} />
                        </td>

                        <td className="px-4 py-3 font-semibold">
                          {stock?.ticker ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {order?.shares ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {order ? formatCurrency(order.pricePerShare) : "—"}
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-medium ${
                            isInflow
                              ? "text-profit"
                              : isOutflow
                                ? "text-loss"
                                : ""
                          }`}
                        >
                          {isInflow ? "+" : isOutflow ? "-" : ""}
                          {formatCurrency(t.amount)}
                        </td>

                        <td className="px-6 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => setSelected(t)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t px-6 py-3">
                <span className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {transactions.length}{" "}
                  transactions
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Transaction details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4 px-4">
                <div className="rounded-lg border p-4">
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {formatCurrency(selected.amount)}
                  </div>
                  <TypeBadge type={selected.type} className="mt-2" />
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Transaction ID", `#${selected._id.slice(-6).toUpperCase()}`],
                    ["Date & time", formatDate(selected.createdAt)],
                    ["Type", selected.type],
                    ["Symbol", getStock(selected)?.ticker ?? "—"],
                    ["Shares", String(getOrder(selected)?.shares ?? "—")],
                    [
                      "Price / share",
                      getOrder(selected)
                        ? formatCurrency(getOrder(selected)!.pricePerShare)
                        : "—",
                    ],
                    ["Description", selected.description ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function TypeBadge({
  type,
  className = "",
}: {
  type: TransactionType;
  className?: string;
}) {
  const styles: Record<TransactionType, string> = {
    BUY: "bg-profit/10 text-profit border-profit/20",
    SELL: "bg-loss/10 text-loss border-loss/20",
    DEPOSIT: "bg-primary/10 text-primary border-primary/20",
    WITHDRAWAL: "bg-gold/10 text-gold border-gold/30",
    MANUAL_ADJUSTMENT: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={`${styles[type]} ${className}`}>
      {type}
    </Badge>
  );
}

function StatePanel({
  text,
  error = false,
  action,
}: {
  text: string;
  error?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`grid place-items-center p-10 text-center ${
        error ? "text-loss" : "text-muted-foreground"
      }`}
    >
      <Receipt className="h-8 w-8" />
      <div className="mt-3 text-sm">{text}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}