import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  holdings,
  marketOverview,
  notifications,
  portfolioGrowth,
  sectorAllocation,
  stocks,
  transactions,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Meridian Trading Platform" },
      { name: "description", content: "Portfolio value, wallet balance, P&L, watchlist and market overview at a glance." },
      { property: "og:title", content: "Dashboard · Meridian" },
      { property: "og:description", content: "Your complete trading dashboard." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["#1E3A8A", "#22C55E", "#F59E0B", "#3B82F6", "#EF4444", "#94A3B8"];

function Dashboard() {
  const watchlist = stocks.slice(0, 5);
  return (
    <AppShell title="Welcome back, Sarah" subtitle="Here's what's happening with your portfolio today.">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Portfolio Value" value="$128,450.32" delta="+$3,214.80 (2.56%)" deltaTone="profit" hint="today" icon={Wallet} />
        <StatCard label="Wallet Balance" value="$14,282.10" delta="Available to trade" deltaTone="neutral" icon={DollarSign} />
        <StatCard label="Total P&L" value="+$28,412.55" delta="+28.4% all-time" deltaTone="profit" icon={TrendingUp} />
        <StatCard label="Top Performer" value="NVDA +34.7%" delta="Since purchase" deltaTone="profit" icon={Star} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {marketOverview.map((m) => (
          <div key={m.name} className="card-elev p-4">
            <div className="text-xs text-muted-foreground">{m.name}</div>
            <div className="mt-1 text-lg font-semibold">{m.value}</div>
            <div className={`mt-0.5 text-xs font-medium ${m.change >= 0 ? "text-profit" : "text-loss"}`}>
              {m.change >= 0 ? "+" : ""}{m.change}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Portfolio Growth</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </div>
            <div className="flex gap-1">
              {["1D","1W","1M","3M","1Y","ALL"].map((r,i) => (
                <Button key={r} variant={i===2?"default":"ghost"} size="sm" className="h-7 px-2 text-xs">{r}</Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={portfolioGrowth}>
                  <defs>
                    <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} fill="url(#pgrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Allocation</CardTitle>
            <p className="text-xs text-muted-foreground">By sector</p>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sectorAllocation} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {sectorAllocation.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
              {sectorAllocation.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.slice(0, 6).map((t) => {
                const isBuy = t.type === "BUY" || t.type === "DEPOSIT";
                return (
                  <div key={t.id} className="flex items-center gap-3 px-6 py-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isBuy ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
                      {isBuy ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {t.type} {t.symbol !== "-" && <span className="text-muted-foreground">· {t.symbol}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${t.total.toLocaleString()}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">{t.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Badge className="bg-loss text-white">2 new</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className={`rounded-md border p-3 ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
                  <span className="text-[11px] text-muted-foreground">{n.time}</span>
                </div>
                <div className="mt-1 text-sm font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Watchlist</CardTitle>
            <Button variant="outline" size="sm">Manage</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
                  <tr>
                    <th className="text-left px-6 py-2.5 font-medium">Symbol</th>
                    <th className="text-left px-4 py-2.5 font-medium">Name</th>
                    <th className="text-right px-4 py-2.5 font-medium">Price</th>
                    <th className="text-right px-4 py-2.5 font-medium">Change</th>
                    <th className="text-right px-4 py-2.5 font-medium">Volume</th>
                    <th className="px-6 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((s) => {
                    const up = s.change >= 0;
                    return (
                      <tr key={s.symbol} className="border-t hover:bg-muted/30">
                        <td className="px-6 py-3 font-semibold">{s.symbol}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.name}</td>
                        <td className="px-4 py-3 text-right font-medium">${s.price.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${up ? "text-profit" : "text-loss"}`}>
                          <span className="inline-flex items-center gap-1">
                            {up ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                            {up ? "+" : ""}{s.changePct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{s.volume}</td>
                        <td className="px-6 py-3 text-right">
                          <Button size="sm" className="h-7">Trade</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
