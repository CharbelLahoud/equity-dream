import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { stockChart, stocks } from "@/lib/mock-data";

export const Route = createFileRoute("/stocks")({
  head: () => ({
    meta: [
      { title: "Stocks · Meridian Trading" },
      { name: "description", content: "Browse, search and trade thousands of stocks across sectors." },
      { property: "og:title", content: "Stocks · Meridian" },
      { property: "og:description", content: "Browse and trade stocks in real time." },
    ],
  }),
  component: StocksPage,
});

const sectors = ["All", "Technology", "Financials", "Consumer", "Healthcare", "Energy", "Semiconductors", "Automotive"];

function StocksPage() {
  const [sector, setSector] = useState("All");
  const filtered = sector === "All" ? stocks : stocks.filter(s => s.sector === sector);

  return (
    <AppShell title="Stocks" subtitle="Discover and trade equities in real time.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by symbol or company name..." className="pl-9 h-11" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="marketcap">
            <SelectTrigger className="w-[160px] h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="marketcap">Market Cap</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change">% Change</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11">Filters</Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              sector === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Featured stock cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.slice(0, 4).map((s) => {
          const up = s.change >= 0;
          return (
            <div key={s.symbol} className="card-elev p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{s.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">{s.name}</div>
                </div>
                <button className="text-muted-foreground hover:text-gold">
                  <Star className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">${s.price.toFixed(2)}</div>
              <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${up ? "text-profit" : "text-loss"}`}>
                {up ? <TrendingUp className="h-3.5 w-3.5"/> : <TrendingDown className="h-3.5 w-3.5"/>}
                {up ? "+" : ""}{s.change.toFixed(2)} ({up ? "+" : ""}{s.changePct}%)
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1 h-8 bg-profit hover:bg-profit/90 text-white">Buy</Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 border-loss/30 text-loss hover:bg-loss/10">Sell</Button>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All stocks</CardTitle>
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Symbol</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Sector</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Change</th>
                  <th className="text-right px-4 py-3 font-medium">Market Cap</th>
                  <th className="text-right px-4 py-3 font-medium">Volume</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const up = s.change >= 0;
                  return (
                    <tr key={s.symbol} className="border-t hover:bg-muted/30">
                      <td className="px-6 py-3 font-semibold">{s.symbol}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.name}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{s.sector}</Badge></td>
                      <td className="px-4 py-3 text-right font-medium">${s.price.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${up ? "text-profit" : "text-loss"}`}>
                        {up ? "+" : ""}{s.changePct}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{s.marketCap}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{s.volume}</td>
                      <td className="px-6 py-3 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8">Details</Button>
                          </DialogTrigger>
                          <StockDetailModal stock={s} />
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StockDetailModal({ stock }: { stock: typeof stocks[number] }) {
  const up = stock.change >= 0;
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-2xl">{stock.symbol} <span className="text-base font-normal text-muted-foreground">· {stock.name}</span></DialogTitle>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-3xl font-semibold">${stock.price.toFixed(2)}</div>
              <div className={`text-sm font-medium ${up ? "text-profit" : "text-loss"}`}>
                {up ? "+" : ""}{stock.change.toFixed(2)} ({up ? "+" : ""}{stock.changePct}%)
              </div>
            </div>
          </div>
          <Button variant="outline" size="icon"><Star className="h-4 w-4" /></Button>
        </div>
      </DialogHeader>

      <Tabs defaultValue="chart" className="mt-2">
        <TabsList>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-2 h-64">
        <ResponsiveContainer>
          <AreaChart data={stockChart}>
            <defs>
              <linearGradient id="sgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={up ? "#22C55E" : "#EF4444"} stopOpacity={0.3} />
                <stop offset="100%" stopColor={up ? "#22C55E" : "#EF4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="t" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} domain={["auto","auto"]} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="price" stroke={up ? "#22C55E" : "#EF4444"} strokeWidth={2} fill="url(#sgrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-4">
        {[["Market Cap", stock.marketCap],["Volume", stock.volume],["P/E Ratio", "28.4"],["Dividend", "0.52%"]].map(([k,v]) => (
          <div key={k} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="mt-1 font-semibold">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button className="flex-1 h-11 bg-profit hover:bg-profit/90 text-white">Buy {stock.symbol}</Button>
        <Button variant="outline" className="flex-1 h-11 border-loss/30 text-loss hover:bg-loss/10">Sell {stock.symbol}</Button>
      </div>
    </DialogContent>
  );
}
