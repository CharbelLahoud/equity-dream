import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sectorAllocation, tradingVolume, stocks } from "@/lib/mock-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics · Meridian Trading" },
      { name: "description", content: "Trading volume, top stocks and platform trends." },
      { property: "og:title", content: "Analytics · Meridian" },
      { property: "og:description", content: "Deep insight into platform performance." },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["#1E3A8A", "#22C55E", "#F59E0B", "#3B82F6", "#EF4444", "#94A3B8"];

function AnalyticsPage() {
  const topStocks = [...stocks].sort((a,b) => b.changePct - a.changePct).slice(0, 6);
  return (
    <AppShell title="Analytics" subtitle="Platform-wide trading trends and performance.">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Members" value="24,318" delta="+8.2% MoM" deltaTone="profit" icon={Users}/>
        <StatCard label="Trading Volume" value="$1.42B" delta="+12.5% MoM" deltaTone="profit" icon={DollarSign}/>
        <StatCard label="Trades Executed" value="184,922" delta="+3.1% MoM" deltaTone="profit" icon={Activity}/>
        <StatCard label="Avg P&L / User" value="+4.72%" delta="+0.6pp MoM" deltaTone="profit" icon={TrendingUp}/>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Trading Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={tradingVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                  <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="volume" fill="#1E3A8A" radius={[6,6,0,0]}/>
                  <Bar dataKey="trades" fill="#F59E0B" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sector Allocation</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sectorAllocation} dataKey="value" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {sectorAllocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              {sectorAllocation.map((s,i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{background: PIE_COLORS[i]}}/>
                  <span className="text-muted-foreground flex-1">{s.name}</span>
                  <span className="font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Stocks (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={topStocks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                  <XAxis type="number" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <YAxis type="category" dataKey="symbol" tick={{fontSize:11}} tickLine={false} axisLine={false} width={55}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="changePct" radius={[0,6,6,0]}>
                    {topStocks.map((s,i) => <Cell key={i} fill={s.changePct >= 0 ? "#22C55E" : "#EF4444"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>New Members Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={tradingVolume.map((t,i) => ({month:t.month, users: 800 + i * 220 + Math.sin(i*0.9)*180}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                  <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Line type="monotone" dataKey="users" stroke="#1E3A8A" strokeWidth={2.5} dot={{r:3}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {l:"Order fill rate", v: "98.7%", d:"+0.3pp"},
              {l:"Avg execution time", v: "142 ms", d:"-8 ms"},
              {l:"Customer satisfaction", v: "4.86/5", d:"+0.02"},
              {l:"Support response", v: "3m 42s", d:"-22s"},
            ].map(k => (
              <div key={k.l} className="rounded-lg border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
                <div className="mt-2 text-2xl font-semibold">{k.v}</div>
                <div className="text-xs text-profit mt-1">{k.d} vs last month</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
