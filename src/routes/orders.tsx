import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, RefreshCw } from "lucide-react";

import {
  getOrders,
  type Order,
} from "@/services/orders.service";

import {
  getStocks,
  type Stock,
} from "@/services/stocks.service";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders · Meridian Trading" },
      {
        name: "description",
        content: "Track your open, filled and cancelled orders.",
      },
      { property: "og:title", content: "Orders · Meridian" },
      { property: "og:description", content: "Manage buy and sell orders." },
    ],
  }),
  component: OrdersPage,
});

// How often to poll for new orders while this page is open, so an
// order placed on the Stocks page shows up here without a manual
// refresh. Matches the stocks page's price-poll cadence.
const ORDERS_REFRESH_INTERVAL_MS = 30_000;

function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    retry: false,
    refetchInterval: ORDERS_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  // Orders likely only store stockId (per the confirmed CreateOrderDto),
  // so stocks are fetched too and used to fill in ticker/company/price
  // whenever an order doesn't already carry that data itself.
  const { data: stocksResponse } = useQuery({
    queryKey: ["stocks"],
    queryFn: getStocks,
  });

  const orders: Order[] = Array.isArray(ordersResponse)
    ? ordersResponse
    : [];

  const stocks: Stock[] = Array.isArray(stocksResponse)
    ? stocksResponse
    : [];

  const stocksById = useMemo(() => {
    const map = new Map<string, Stock>();
    stocks.forEach((stock) => map.set(stock._id, stock));
    return map;
  }, [stocks]);

  function resolveOrderView(order: Order) {
    const stock = stocksById.get(order.stockId);

    const ticker = order.ticker ?? stock?.ticker ?? order.stockId;
    const companyName = order.companyName ?? stock?.companyName ?? "";

    const pricePerShare =
      order.pricePerShare ??
      (order.totalAmount ? order.totalAmount / order.shares : undefined) ??
      stock?.currentPrice ??
      0;

    const totalAmount =
      order.totalAmount ?? pricePerShare * order.shares;

    return { ticker, companyName, pricePerShare, totalAmount };
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!normalizedSearch) return orders;

    return orders.filter((order) => {
      const { ticker, companyName } = resolveOrderView(order);

      return (
        ticker.toLowerCase().includes(normalizedSearch) ||
        companyName.toLowerCase().includes(normalizedSearch) ||
        order._id.toLowerCase().includes(normalizedSearch)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, normalizedSearch, stocksById]);

  const buyOrders = filteredOrders.filter((order) => order.type === "BUY");
  const sellOrders = filteredOrders.filter((order) => order.type === "SELL");

  const totalTraded = useMemo(
    () =>
      orders.reduce(
        (sum, order) => sum + resolveOrderView(order).totalAmount,
        0,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, stocksById],
  );

  async function refreshOrders() {
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <AppShell
      title="Orders"
      subtitle="View your buy and sell order history."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { l: "Total orders", v: orders.length, c: "text-foreground" },
          {
            l: "Buy orders",
            v: orders.filter((o) => o.type === "BUY").length,
            c: "text-profit",
          },
          {
            l: "Sell orders",
            v: orders.filter((o) => o.type === "SELL").length,
            c: "text-loss",
          },
          {
            l: "Total traded",
            v: formatCurrency(totalTraded),
            c: "text-foreground",
          },
        ].map((s) => (
          <div key={s.l} className="card-elev p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {s.l}
            </div>
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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by symbol, company, or order id..."
                  className="h-9 w-64 pl-9"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => void refetchOrders()}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {ordersLoading ? (
            <StatePanel text="Loading orders..." />
          ) : ordersError ? (
            <StatePanel
              text="Unable to load orders."
              error
              action={
                <Button variant="outline" onClick={() => void refetchOrders()}>
                  Try again
                </Button>
              }
            />
          ) : (
            <Tabs defaultValue="all">
              <div className="px-6">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({filteredOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="buy">
                    Buy orders ({buyOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="sell">
                    Sell orders ({sellOrders.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-4">
                <OrderTable
                  list={filteredOrders}
                  resolveOrderView={resolveOrderView}
                />
              </TabsContent>

              <TabsContent value="buy" className="mt-4">
                <OrderTable
                  list={buyOrders}
                  resolveOrderView={resolveOrderView}
                />
              </TabsContent>

              <TabsContent value="sell" className="mt-4">
                <OrderTable
                  list={sellOrders}
                  resolveOrderView={resolveOrderView}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function OrderTable({
  list,
  resolveOrderView,
}: {
  list: Order[];
  resolveOrderView: (order: Order) => {
    ticker: string;
    companyName: string;
    pricePerShare: number;
    totalAmount: number;
  };
}) {
  if (list.length === 0) {
    return (
      <div className="grid place-items-center py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="mt-4 font-medium">No orders yet</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Buy or sell a stock from the Stocks page and it will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-6 py-3 text-left font-medium">Order ID</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Symbol</th>
            <th className="px-4 py-3 text-right font-medium">Shares</th>
            <th className="px-4 py-3 text-right font-medium">Price / Share</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            {list.some((o) => o.status) && (
              <th className="px-4 py-3 text-left font-medium">Status</th>
            )}
          </tr>
        </thead>

        <tbody>
          {list.map((order) => {
            const { ticker, companyName, pricePerShare, totalAmount } =
              resolveOrderView(order);

            const isBuy = order.type === "BUY";

            return (
              <tr key={order._id} className="border-t hover:bg-muted/30">
                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                  #{order._id.slice(-6).toUpperCase()}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>

                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      isBuy
                        ? "border-profit/20 bg-profit/10 text-profit"
                        : "border-loss/20 bg-loss/10 text-loss"
                    }
                  >
                    {order.type}
                  </Badge>
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold">{ticker}</div>
                  {companyName && (
                    <div className="text-xs text-muted-foreground">
                      {companyName}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-right">{order.shares}</td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(pricePerShare)}
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(totalAmount)}
                </td>

                {list.some((o) => o.status) && (
                  <td className="px-4 py-3">
                    {order.status && (
                      <Badge variant="outline">{order.status}</Badge>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StatePanel({
  text,
  error = false,
  action,
}: {
  text: string;
  error?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`grid place-items-center p-10 text-center ${
        error ? "text-loss" : "text-muted-foreground"
      }`}
    >
      <ClipboardList className="h-8 w-8" />
      <div className="mt-3 text-sm">{text}</div>
      {action && <div className="mt-4">{action}</div>}
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
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}