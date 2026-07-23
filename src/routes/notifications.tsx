import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { notifications, priceAlerts } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Meridian Trading" },
      { name: "description", content: "Alerts, order updates and price notifications." },
      { property: "og:title", content: "Notifications · Meridian" },
      { property: "og:description", content: "Stay on top of your account activity." },
    ],
  }),
  component: NotifPage,
});

function NotifPage() {
  const unread = notifications.filter(n => !n.read);
  return (
    <AppShell title="Notifications" subtitle="Alerts, order updates and price triggers.">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity</CardTitle>
              <Button variant="ghost" size="sm">Mark all read</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all">
              <div className="px-6">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
                  <TabsTrigger value="alert">Price Alerts</TabsTrigger>
                  <TabsTrigger value="order">Orders</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="mt-2">
                <NotifList list={notifications}/>
              </TabsContent>
              <TabsContent value="unread" className="mt-2">
                <NotifList list={unread}/>
              </TabsContent>
              <TabsContent value="alert" className="mt-2">
                <NotifList list={notifications.filter(n => n.category === "Price Alert")}/>
              </TabsContent>
              <TabsContent value="order" className="mt-2">
                <NotifList list={notifications.filter(n => n.category === "Order")}/>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Price Alerts</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Get notified when a target is hit.</p>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1"/>New</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {priceAlerts.map(a => {
                const above = a.condition === ">";
                return (
                  <div key={a.symbol + a.target} className="flex items-center gap-3 rounded-md border p-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${above ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
                      {above ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{a.symbol} {a.condition} ${a.target.toFixed(2)}</div>
                      <div className="text-[11px] text-muted-foreground">Current: ${a.current.toFixed(2)}</div>
                    </div>
                    <Switch defaultChecked={a.active}/>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                {l:"Order fills",d:"When your orders execute"},
                {l:"Price alerts",d:"When targets are triggered"},
                {l:"Portfolio moves",d:"When P&L moves > 3%"},
                {l:"Market news",d:"Weekly market outlook"},
                {l:"Product updates",d:"New features & releases"},
              ].map((p,i) => (
                <div key={p.l} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{p.l}</div>
                    <div className="text-xs text-muted-foreground">{p.d}</div>
                  </div>
                  <Switch defaultChecked={i < 3}/>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function NotifList({ list }: { list: typeof notifications }) {
  if (list.length === 0) {
    return (
      <div className="grid place-items-center py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
          <Bell className="h-6 w-6 text-muted-foreground"/>
        </div>
        <div className="mt-4 font-medium">You're all caught up</div>
        <div className="text-sm text-muted-foreground mt-1">No notifications in this view.</div>
      </div>
    );
  }
  return (
    <div className="divide-y">
      {list.map(n => (
        <div key={n.id} className={`flex gap-3 px-6 py-4 ${!n.read ? "bg-primary/5" : ""}`}>
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{background: n.read ? "transparent" : "#1E3A8A"}}/>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
              <span className="text-[11px] text-muted-foreground">{n.time}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{n.title}</div>
            <div className="text-xs text-muted-foreground">{n.body}</div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
        </div>
      ))}
    </div>
  );
}
