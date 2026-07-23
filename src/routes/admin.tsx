import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, DollarSign, LineChart as LineIcon, ShieldCheck, Search, MoreHorizontal, Plus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { users, portfolioGrowth, stocks } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Meridian Trading" },
      { name: "description", content: "Manage members, stocks and platform activity." },
      { property: "og:title", content: "Admin · Meridian" },
      { property: "og:description", content: "Administrative dashboard for platform operators." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AppShell title="Admin Dashboard" subtitle="Manage members, listings and platform activity.">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Members" value="24,318" delta="+412 this week" deltaTone="profit" icon={Users}/>
        <StatCard label="Assets Under Mgmt" value="$842.5M" delta="+3.2% MoM" deltaTone="profit" icon={DollarSign}/>
        <StatCard label="Listed Stocks" value="8,412" hint="12 markets" icon={LineIcon}/>
        <StatCard label="KYC Approvals" value="97.4%" delta="+0.6pp" deltaTone="profit" icon={ShieldCheck}/>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Platform Activity</CardTitle>
            <Badge variant="outline" className="border-profit/30 text-profit bg-profit/10">Healthy</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={portfolioGrowth}>
                  <defs>
                    <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                  <XAxis dataKey="day" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} width={60}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Area type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} fill="url(#agrad)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              {u:"Priya Patel",a:"upgraded to Premium",t:"12m ago",c:"profit"},
              {u:"David Kim",a:"flagged for review",t:"1h ago",c:"loss"},
              {u:"Emma Wilson",a:"deposited $25,000",t:"2h ago",c:"profit"},
              {u:"James Rivera",a:"submitted KYC",t:"3h ago",c:"muted"},
              {u:"Michael Chen",a:"opened 3 positions",t:"5h ago",c:"muted"},
            ].map((r,i) => (
              <div key={i} className="flex items-center gap-3">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{r.u.split(" ").map(x=>x[0]).join("")}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><span className="font-medium">{r.u}</span> <span className="text-muted-foreground">{r.a}</span></div>
                  <div className="text-[11px] text-muted-foreground">{r.t}</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${r.c==="profit"?"bg-profit":r.c==="loss"?"bg-loss":"bg-muted-foreground"}`}/>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Manage user accounts and permissions.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                <Input placeholder="Search members..." className="pl-9 h-9 w-60"/>
              </div>
              <Button size="sm" className="h-9"><Plus className="h-4 w-4 mr-1"/>Invite</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Member</th>
                  <th className="text-left px-4 py-3 font-medium">User ID</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 font-medium">Portfolio</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-6 py-3"/>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                    <td className="px-4 py-3 text-right font-medium">${u.portfolio.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={u.role==="Premium"?"bg-gold/10 text-gold border-gold/30":""}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={
                        u.status==="Active"?"bg-profit/10 text-profit border-profit/20":
                        u.status==="Suspended"?"bg-loss/10 text-loss border-loss/20":
                        "bg-gold/10 text-gold border-gold/30"
                      }>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stock Management</CardTitle>
            <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1"/>Add listing</Button>
          </div>
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
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-6 py-3"/>
                </tr>
              </thead>
              <tbody>
                {stocks.slice(0,6).map(s => (
                  <tr key={s.symbol} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3 font-semibold">{s.symbol}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{s.sector}</Badge></td>
                    <td className="px-4 py-3 text-right font-medium">${s.price.toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="bg-profit/10 text-profit border-profit/20">Active</Badge></td>
                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
