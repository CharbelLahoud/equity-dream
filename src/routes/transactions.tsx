import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { transactions } from "@/lib/mock-data";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions · Meridian Trading" },
      {
        name: "description",
        content: "Complete history of your trades, deposits and withdrawals.",
      },
      { property: "og:title", content: "Transactions · Meridian" },
      { property: "og:description", content: "Search and filter your transaction history." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [selected, setSelected] = useState<(typeof transactions)[number] | null>(null);

  return (
    <AppShell title="Transactions" subtitle="Complete log of trades, deposits and withdrawals.">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All transactions</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search ID, symbol..." className="pl-9 h-9 w-56" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdraw">Withdraw</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30">
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="year">Year to date</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-1" />
                More
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Symbol</th>
                  <th className="text-right px-4 py-3 font-medium">Shares</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          t.type === "BUY"
                            ? "bg-profit/10 text-profit border-profit/20"
                            : t.type === "SELL"
                              ? "bg-loss/10 text-loss border-loss/20"
                              : "bg-primary/10 text-primary border-primary/20"
                        }
                      >
                        {t.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">{t.symbol}</td>
                    <td className="px-4 py-3 text-right">{t.shares || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      {t.price ? `$${t.price.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${t.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          t.status === "Completed"
                            ? "bg-profit/10 text-profit border-profit/20"
                            : t.status === "Pending"
                              ? "bg-gold/10 text-gold border-gold/30"
                              : "bg-loss/10 text-loss border-loss/20"
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => setSelected(t)}
                          >
                            View
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Transaction details</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-4 px-4">
                            <div className="rounded-lg border p-4">
                              <div className="text-xs text-muted-foreground">Amount</div>
                              <div className="mt-1 text-2xl font-semibold">
                                ${(selected?.total ?? t.total).toLocaleString()}
                              </div>
                              <Badge variant="outline" className="mt-2">
                                {selected?.status ?? t.status}
                              </Badge>
                            </div>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                              {[
                                ["Transaction ID", selected?.id ?? t.id],
                                ["Date & time", selected?.date ?? t.date],
                                ["Type", selected?.type ?? t.type],
                                ["Symbol", selected?.symbol ?? t.symbol],
                                ["Shares", String(selected?.shares ?? t.shares) || "-"],
                                [
                                  "Price",
                                  (selected?.price ?? t.price)
                                    ? `$${(selected?.price ?? t.price).toFixed(2)}`
                                    : "-",
                                ],
                                ["Fee", "$0.00"],
                                ["Settlement", "T+2"],
                              ].map(([k, v]) => (
                                <div key={k as string}>
                                  <dt className="text-muted-foreground text-xs">{k}</dt>
                                  <dd className="mt-0.5 font-medium">{v}</dd>
                                </div>
                              ))}
                            </dl>
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" className="flex-1">
                                Download receipt
                              </Button>
                              <Button variant="outline" className="flex-1">
                                Report issue
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-6 py-3">
            <span className="text-xs text-muted-foreground">
              Showing 1–{transactions.length} of 248 transactions
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {["1", "2", "3", "…", "25"].map((p, i) => (
                <Button
                  key={i}
                  variant={p === "1" ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
