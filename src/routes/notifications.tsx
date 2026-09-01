import { useMemo, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bell, Plus, TrendingDown, TrendingUp } from "lucide-react";

import {
  createPriceAlert,
  getNotifications,
  getPriceAlerts,
  getStocksForAlerts,
  markAllNotificationsRead,
  updatePriceAlertStatus,
  type NotificationItem,
  type PriceAlert,
} from "@/services/notifications.service";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      {
        title: "Notifications · Meridian Trading",
      },
      {
        name: "description",
        content: "Alerts, order updates and price notifications.",
      },
    ],
  }),

  component: NotificationsPage,
});

function NotificationsPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);

  const [stockId, setStockId] = useState("");

  const [targetPrice, setTargetPrice] = useState("");

  const [direction, setDirection] = useState<"ABOVE" | "BELOW">("ABOVE");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    retry: false,
  });

  const alertsQuery = useQuery({
    queryKey: ["notifications", "price-alerts"],
    queryFn: getPriceAlerts,
    retry: false,
  });

  const stocksQuery = useQuery({
    queryKey: ["stocks", "alert-selection"],
    queryFn: getStocksForAlerts,
    retry: false,
  });

  const notifications = Array.isArray(notificationsQuery.data) ? notificationsQuery.data : [];

  const alerts = Array.isArray(alertsQuery.data) ? alertsQuery.data : [];

  const stocks = Array.isArray(stocksQuery.data) ? stocksQuery.data : [];

  const unread = useMemo(() => notifications.filter((item) => !item.isRead), [notifications]);

  const priceNotifications = useMemo(
    () => notifications.filter((item) => item.type === "PRICE_ALERT"),
    [notifications],
  );

  const orderNotifications = useMemo(
    () => notifications.filter((item) => item.type === "TRADE_EXECUTED"),
    [notifications],
  );

  const createAlertMutation = useMutation({
    mutationFn: createPriceAlert,

    onSuccess: async () => {
      setStockId("");
      setTargetPrice("");
      setDirection("ABOVE");
      setShowForm(false);

      showMessage("Price alert created successfully.", "success");

      await queryClient.invalidateQueries({
        queryKey: ["notifications", "price-alerts"],
      });
    },

    onError: (error: unknown) => {
      showMessage(getErrorMessage(error), "error");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,

    onSuccess: async () => {
      showMessage("Notifications marked as read.", "success");

      await queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },

    onError: (error: unknown) => {
      showMessage(getErrorMessage(error), "error");
    },
  });

  const statusMutation = useMutation({
    mutationFn: updatePriceAlertStatus,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "price-alerts"],
      });
    },

    onError: (error: unknown) => {
      showMessage(getErrorMessage(error), "error");
    },
  });

  function showMessage(text: string, type: "success" | "error") {
    setMessage(text);
    setMessageType(type);
  }

  function handleCreateAlert() {
    setMessage("");
    setMessageType("");

    const price = Number(targetPrice);

    if (!stockId) {
      showMessage("Select a stock.", "error");

      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      showMessage("Enter a valid target price.", "error");

      return;
    }

    createAlertMutation.mutate({
      stockId,
      targetPrice: price,
      direction,
    });
  }

  return (
    <AppShell title="Notifications" subtitle="Alerts, order updates and price triggers.">
      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-profit/30 bg-profit/10 text-profit"
              : "border-loss/30 bg-loss/10 text-loss"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity</CardTitle>

              <Button
                variant="ghost"
                size="sm"
                disabled={unread.length === 0 || markReadMutation.isPending}
                onClick={() => markReadMutation.mutate()}
              >
                {markReadMutation.isPending ? "Updating..." : "Mark all read"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {notificationsQuery.isLoading ? (
              <StatePanel text="Loading notifications..." />
            ) : notificationsQuery.isError ? (
              <StatePanel text="Unable to load notifications." error />
            ) : (
              <Tabs defaultValue="all">
                <div className="overflow-x-auto px-6">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>

                    <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>

                    <TabsTrigger value="alerts">Price Alerts</TabsTrigger>

                    <TabsTrigger value="orders">Orders</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-2">
                  <NotificationList list={notifications} />
                </TabsContent>

                <TabsContent value="unread" className="mt-2">
                  <NotificationList list={unread} />
                </TabsContent>

                <TabsContent value="alerts" className="mt-2">
                  <NotificationList list={priceNotifications} />
                </TabsContent>

                <TabsContent value="orders" className="mt-2">
                  <NotificationList list={orderNotifications} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Price Alerts</CardTitle>

                <p className="mt-1 text-xs text-muted-foreground">
                  Get notified when a target is hit.
                </p>
              </div>

              <Button size="sm" onClick={() => setShowForm((current) => !current)}>
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {showForm && (
                <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label>Stock</Label>

                    <Select value={stockId} onValueChange={setStockId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stock" />
                      </SelectTrigger>

                      <SelectContent>
                        {stocks.map((stock) => {
                          if (!stock._id) {
                            return null;
                          }

                          const symbol = stock.ticker ?? stock.symbol ?? "Stock";

                          return (
                            <SelectItem key={stock._id} value={stock._id}>
                              {symbol}
                              {stock.companyName ? ` · ${stock.companyName}` : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {stocksQuery.isError && (
                      <p className="text-xs text-loss">Unable to load stocks.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-price">Target price</Label>

                    <Input
                      id="target-price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={targetPrice}
                      placeholder="200.00"
                      onChange={(event) => setTargetPrice(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Direction</Label>

                    <Select
                      value={direction}
                      onValueChange={(value) => setDirection(value as "ABOVE" | "BELOW")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ABOVE">Above</SelectItem>

                        <SelectItem value="BELOW">Below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={createAlertMutation.isPending}
                      onClick={handleCreateAlert}
                    >
                      {createAlertMutation.isPending ? "Creating..." : "Create alert"}
                    </Button>

                    <Button variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {alertsQuery.isLoading ? (
                <StatePanel text="Loading price alerts..." />
              ) : alertsQuery.isError ? (
                <StatePanel text="Unable to load price alerts." error />
              ) : alerts.length === 0 ? (
                <StatePanel text="No price alerts yet." />
              ) : (
                alerts.map((alert) => (
                  <PriceAlertRow
                    key={alert._id}
                    alert={alert}
                    disabled={statusMutation.isPending}
                    onStatusChange={(isActive) =>
                      statusMutation.mutate({
                        alertId: alert._id,
                        isActive,
                      })
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <PreferenceRow label="Order fills" description="When your orders execute" />

              <PreferenceRow label="Price alerts" description="When targets are triggered" />

              <PreferenceRow label="Portfolio moves" description="When portfolio values change" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function NotificationList({ list }: { list: NotificationItem[] }) {
  if (list.length === 0) {
    return <StatePanel text="No notifications in this view." />;
  }

  return (
    <div className="divide-y">
      {list.map((item) => (
        <div
          key={item._id}
          className={`flex gap-3 px-6 py-4 ${!item.isRead ? "bg-primary/5" : ""}`}
        >
          <div
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{
              background: item.isRead ? "transparent" : "#1E3A8A",
            }}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {formatType(item.type)}
              </Badge>

              <span className="text-[11px] text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>
            </div>

            <div className="mt-1 text-sm font-medium">{item.subject}</div>

            <div className="text-xs text-muted-foreground">{item.body}</div>
          </div>

          <Badge variant="outline" className="h-fit text-[10px]">
            {item.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function PriceAlertRow({
  alert,
  disabled,
  onStatusChange,
}: {
  alert: PriceAlert;
  disabled: boolean;
  onStatusChange: (isActive: boolean) => void;
}) {
  const stock = typeof alert.stockId === "object" ? alert.stockId : undefined;

  const symbol = stock?.ticker ?? stock?.symbol ?? "Stock";

  const above = alert.direction === "ABOVE";

  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
          above ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
        }`}
      >
        {above ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">
          {symbol} {above ? "above" : "below"} {formatCurrency(alert.targetPrice)}
        </div>

        <div className="text-[11px] text-muted-foreground">
          {typeof stock?.currentPrice === "number"
            ? `Current: ${formatCurrency(stock.currentPrice)}`
            : `Created: ${formatDate(alert.createdAt)}`}
        </div>
      </div>

      <Switch checked={alert.isActive} disabled={disabled} onCheckedChange={onStatusChange} />
    </div>
  );
}

function PreferenceRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{label}</div>

        <div className="text-xs text-muted-foreground">{description}</div>
      </div>

      <Switch defaultChecked disabled />
    </div>
  );
}

function StatePanel({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      className={`grid place-items-center rounded-md border border-dashed px-6 py-10 text-center text-sm ${
        error ? "border-loss/30 bg-loss/10 text-loss" : "text-muted-foreground"
      }`}
    >
      <Bell className="h-5 w-5" />

      <div className="mt-3">{text}</div>
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
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string | string[];
          };
        };
      }
    ).response;

    const message = response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The notification request could not be completed.";
}
