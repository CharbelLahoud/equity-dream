import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { holdings, portfolioGrowth, sectorAllocation } from "@/lib/mock-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio · Meridian Trading" },
      { name: "description", content: "Holdings, allocation and performance of your portfolio." },
      { property: "og:title", content: "Portfolio · Meridian" },
      { property: "og:description", content: "Track your holdings and performance." },
    ],
  }),
  component: PortfolioPage,
});

const PIE_COLORS = ["#1E3A8A", "#22C55E", "#F59E0B", "#3B82F6", "#EF4444", "#94A3B8", "#8B5CF6"];

function PortfolioPage() {
  const totalValue = holdings.reduce((a, h) => a + h.shares * h.currentPrice, 0);
  const totalCost = holdings.reduce((a, h) => a + h.shares * h.avgPrice, 0);
  const pl = totalValue - totalCost;
  const plPct = (pl / totalCost) * 100;

  return (
    <AppShell title="Portfolio" subtitle="Your holdings, allocation and performance.">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} delta="+2.56% today" deltaTone="profit" icon={Wallet}/>
        <StatCard label="Total Cost" value={`$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} hint="Invested capital" icon={Percent}/>
        <StatCard label="Unrealized P&L" value={`+$${pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} delta={`+${plPct.toFixed(2)}%`} deltaTone="profit" icon={TrendingUp}/>
        <StatCard label="Day Change" value="+$3,214.80" delta="+2.56%" deltaTone="profit" icon={TrendingUp}/>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Performance</CardTitle>
            <div className="flex gap-1">
              {["1W","1M","3M","1Y","ALL"].map((r,i) => (
                <Button key={r} variant={i===1?"default":"ghost"} size="sm" className="h-7 px-2 text-xs">{r}</Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={portfolioGrowth}>
                  <defs>
                    <linearGradient id="perf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} width={60}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#perf)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sectorAllocation} dataKey="value" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {sectorAllocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              {sectorAllocation.map((s,i) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{background: PIE_COLORS[i]}}/>
                  <span className="text-muted-foreground flex-1 truncate">{s.name}</span>
                  <span className="font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Holdings</CardTitle>
          <Button variant="outline" size="sm">Export</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Symbol</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-right px-4 py-3 font-medium">Shares</th>
                  <th className="text-right px-4 py-3 font-medium">Avg Price</th>
                  <th className="text-right px-4 py-3 font-medium">Market Price</th>
                  <th className="text-right px-4 py-3 font-medium">Value</th>
                  <th className="text-right px-4 py-3 font-medium">P&L</th>
                  <th className="text-left px-4 py-3 font-medium">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const value = h.shares * h.currentPrice;
                  const cost = h.shares * h.avgPrice;
                  const p = value - cost;
                  const pPct = (p / cost) * 100;
                  const up = p >= 0;
                  return (
                    <tr key={h.symbol} className="border-t hover:bg-muted/30">
                      <td className="px-6 py-3 font-semibold">{h.symbol}</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.name}</td>
                      <td className="px-4 py-3 text-right">{h.shares}</td>
                      <td className="px-4 py-3 text-right">${h.avgPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">${h.currentPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium">${value.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
                      <td className={`px-4 py-3 text-right font-medium ${up?"text-profit":"text-loss"}`}>
                        <div className="flex items-center justify-end gap-1">
                          {up ? <TrendingUp className="h-3 w-3"/> : <TrendingDown className="h-3 w-3"/>}
                          {up?"+":""}${Math.abs(p).toFixed(0)} ({up?"+":""}{pPct.toFixed(1)}%)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={h.allocation * 4} className="h-1.5 w-24"/>
                          <span className="text-xs text-muted-foreground w-8">{h.allocation}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Monthly Returns</CardTitle></CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={[
                { m: "Feb", r: 2.1 },{ m: "Mar", r: -1.3 },{ m: "Apr", r: 3.8 },
                { m: "May", r: 5.2 },{ m: "Jun", r: -0.8 },{ m: "Jul", r: 4.1 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                <XAxis dataKey="m" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                <Bar dataKey="r" radius={[6,6,0,0]}>
                  {[2.1,-1.3,3.8,5.2,-0.8,4.1].map((v,i) => <Cell key={i} fill={v>=0?"#22C55E":"#EF4444"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
