import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ClipboardList } from "lucide-react";
import { orders } from "@/lib/mock-data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders · Meridian Trading" },
      { name: "description", content: "Track your open, filled and cancelled orders." },
      { property: "og:title", content: "Orders · Meridian" },
      { property: "og:description", content: "Manage buy and sell orders." },
    ],
  }),
  component: OrdersPage,
});

function statusColor(s: string) {
  if (s === "Filled") return "bg-profit/10 text-profit border-profit/20";
  if (s === "Open") return "bg-primary/10 text-primary border-primary/20";
  if (s === "Cancelled") return "bg-muted text-muted-foreground";
  return "bg-loss/10 text-loss border-loss/20";
}

function OrderTable({ list }: { list: typeof orders }) {
  if (list.length === 0) {
    return (
      <div className="grid place-items-center py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
          <ClipboardList className="h-6 w-6 text-muted-foreground"/>
        </div>
        <div className="mt-4 font-medium">No orders yet</div>
        <div className="text-sm text-muted-foreground mt-1">Your placed orders will appear here.</div>
        <Button className="mt-4">Place order</Button>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
          <tr>
            <th className="text-left px-6 py-3 font-medium">Order ID</th>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Type</th>
            <th className="text-left px-4 py-3 font-medium">Symbol</th>
            <th className="text-right px-4 py-3 font-medium">Shares</th>
            <th className="text-right px-4 py-3 font-medium">Limit</th>
            <th className="text-right px-4 py-3 font-medium">Total</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="px-6 py-3"/>
          </tr>
        </thead>
        <tbody>
          {list.map(o => (
            <tr key={o.id} className="border-t hover:bg-muted/30">
              <td className="px-6 py-3 font-mono text-xs">{o.id}</td>
              <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
              <td className="px-4 py-3">
                <Badge className={o.type === "BUY" ? "bg-profit/10 text-profit border-profit/20" : "bg-loss/10 text-loss border-loss/20"} variant="outline">{o.type}</Badge>
              </td>
              <td className="px-4 py-3 font-semibold">{o.symbol}</td>
              <td className="px-4 py-3 text-right">{o.shares}</td>
              <td className="px-4 py-3 text-right">${o.limit.toFixed(2)}</td>
              <td className="px-4 py-3 text-right font-medium">${(o.shares * o.limit).toLocaleString()}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className={statusColor(o.status)}>{o.status}</Badge>
              </td>
              <td className="px-6 py-3 text-right">
                <Button size="sm" variant="ghost" className="h-7">Details</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersPage() {
  const buys = orders.filter(o => o.type === "BUY");
  const sells = orders.filter(o => o.type === "SELL");

  return (
    <AppShell title="Orders" subtitle="View and manage your open and executed orders.">
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        {[
          {l:"Open", v: orders.filter(o=>o.status==="Open").length, c:"text-primary"},
          {l:"Filled today", v: orders.filter(o=>o.status==="Filled").length, c:"text-profit"},
          {l:"Cancelled", v: orders.filter(o=>o.status==="Cancelled").length, c:"text-muted-foreground"},
          {l:"Total orders", v: orders.length, c:"text-foreground"},
        ].map(s => (
          <div key={s.l} className="card-elev p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className={`mt-2 text-2xl font-semibold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All orders</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Search orders..." className="pl-9 h-9 w-56"/>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-[130px]"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                <TabsTrigger value="buy">Buy orders ({buys.length})</TabsTrigger>
                <TabsTrigger value="sell">Sell orders ({sells.length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-4"><OrderTable list={orders}/></TabsContent>
            <TabsContent value="buy" className="mt-4"><OrderTable list={buys}/></TabsContent>
            <TabsContent value="sell" className="mt-4"><OrderTable list={sells}/></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppShell>
  );
}
