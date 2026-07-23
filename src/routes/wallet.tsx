import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, TrendingUp, CreditCard } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { walletHistory, transactions } from "@/lib/mock-data";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Meridian Trading" },
      { name: "description", content: "Deposit, withdraw and review your wallet activity." },
      { property: "og:title", content: "Wallet · Meridian" },
      { property: "og:description", content: "Manage funds and see wallet history." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const deposits = transactions.filter(t => t.type === "DEPOSIT");
  const withdrawals = transactions.filter(t => t.type === "WITHDRAW");

  return (
    <AppShell title="Wallet" subtitle="Manage your cash balance and transfers.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Balance card */}
          <div className="rounded-xl bg-navy text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_80%_20%,#F59E0B_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#1E3A8A_0%,transparent_45%)]"/>
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/60">Available balance</div>
                <div className="mt-2 text-4xl font-semibold tracking-tight">$14,282.10</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                  <span>Buying power: $28,564.20</span>
                  <span className="text-gold">4.75% APY on cash</span>
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10">
                <Wallet className="h-6 w-6"/>
              </div>
            </div>
            <div className="relative mt-6 flex gap-2">
              <Button className="bg-white text-navy hover:bg-white/90">Deposit</Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Withdraw</Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Transfer</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total Deposits" value="$45,200" delta="+$5,000 this month" deltaTone="profit" icon={ArrowDownToLine}/>
            <StatCard label="Total Withdrawals" value="$8,750" hint="Lifetime" icon={ArrowUpFromLine}/>
            <StatCard label="Interest Earned" value="$182.45" delta="+$42.10 last 30d" deltaTone="profit" icon={TrendingUp}/>
          </div>

          <Card>
            <CardHeader><CardTitle>Balance History</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={walletHistory}>
                    <defs>
                      <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                    <XAxis dataKey="day" tick={{fontSize:11}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} width={60}/>
                    <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                    <Area type="monotone" dataKey="balance" stroke="#F59E0B" strokeWidth={2} fill="url(#wgrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transaction Timeline</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative border-l-2 border-border pl-6 space-y-6">
                {transactions.slice(0,6).map((t) => (
                  <li key={t.id} className="relative">
                    <span className={`absolute -left-[31px] top-0 grid h-6 w-6 place-items-center rounded-full ring-4 ring-background ${
                      t.type === "DEPOSIT" ? "bg-profit/15 text-profit" : t.type === "WITHDRAW" ? "bg-loss/15 text-loss" : "bg-primary/15 text-primary"
                    }`}>
                      {t.type === "DEPOSIT" ? <ArrowDownToLine className="h-3 w-3"/> : t.type === "WITHDRAW" ? <ArrowUpFromLine className="h-3 w-3"/> : <CreditCard className="h-3 w-3"/>}
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium">{t.type} {t.symbol !== "-" && `· ${t.symbol}`}</div>
                        <div className="text-xs text-muted-foreground">{t.date} · {t.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${t.total.toLocaleString()}</div>
                        <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right forms */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Move Funds</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                <TabsContent value="deposit" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input placeholder="1,000.00" className="pl-7 h-11"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select defaultValue="bank">
                      <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Chase ••4823</SelectItem>
                        <SelectItem value="wire">Wire transfer</SelectItem>
                        <SelectItem value="ach">ACH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    {["$500","$1K","$5K","Max"].map(q => (
                      <button key={q} className="flex-1 rounded-md border py-1.5 text-xs hover:bg-muted">{q}</button>
                    ))}
                  </div>
                  <Button className="w-full h-11">Deposit funds</Button>
                  <p className="text-[11px] text-muted-foreground">Funds available instantly up to $5,000.</p>
                </TabsContent>
                <TabsContent value="withdraw" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input placeholder="0.00" className="pl-7 h-11"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select defaultValue="bank">
                      <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Chase ••4823</SelectItem>
                        <SelectItem value="wire">Wire transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full h-11" variant="outline">Withdraw</Button>
                  <p className="text-[11px] text-muted-foreground">1-3 business days for ACH transfers.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>History</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="dep">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="dep">Deposits</TabsTrigger>
                  <TabsTrigger value="wd">Withdrawals</TabsTrigger>
                </TabsList>
                <TabsContent value="dep" className="mt-3 space-y-2">
                  {deposits.length === 0 ? <EmptyRow/> : deposits.map(t => <HistRow key={t.id} t={t}/>)}
                  {/* extra samples */}
                  <HistRow t={{id:"TXN-10460",date:"2026-07-10 10:00",total:2500,status:"Completed"}}/>
                  <HistRow t={{id:"TXN-10440",date:"2026-06-28 09:12",total:10000,status:"Completed"}}/>
                </TabsContent>
                <TabsContent value="wd" className="mt-3 space-y-2">
                  {withdrawals.map(t => <HistRow key={t.id} t={t}/>)}
                  <HistRow t={{id:"TXN-10450",date:"2026-07-05 14:22",total:2000,status:"Completed"}}/>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function HistRow({ t }: { t: { id: string; date: string; total: number; status: string } }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">${t.total.toLocaleString()}</div>
        <div className="text-[11px] text-muted-foreground">{t.date}</div>
      </div>
      <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
    </div>
  );
}

function EmptyRow() {
  return <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No records yet.</div>;
}
