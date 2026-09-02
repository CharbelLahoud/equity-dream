import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Activity } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getActiveMembers,
  getSectorAllocation,
  getTopStocks,
  getTradingVolume,
} from "@/services/analytics.service";

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
  const tradingVolumeQuery = useQuery({
    queryKey: ["analytics", "trading-volume"],
    queryFn: getTradingVolume,
    retry: false,
  });

  const topStocksQuery = useQuery({
    queryKey: ["analytics", "top-stocks"],
    queryFn: getTopStocks,
    retry: false,
  });

  const activeMembersQuery = useQuery({
    queryKey: ["analytics", "active-members"],
    queryFn: getActiveMembers,
    retry: false,
  });

  const sectorAllocationQuery = useQuery({
    queryKey: ["analytics", "sector-allocation"],
    queryFn: getSectorAllocation,
    retry: false,
  });

  const monthly = tradingVolumeQuery.data?.monthly ?? [];
  const topStocks = topStocksQuery.data ?? [];
  const monthlyNewMembers = activeMembersQuery.data?.monthlyNewMembers ?? [];
  const sectorAllocation = sectorAllocationQuery.data ?? [];

  return (
    <AppShell title="Analytics" subtitle="Platform-wide trading trends and performance.">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          label="Total Members"
          value={
            activeMembersQuery.isLoading
              ? "..."
              : (activeMembersQuery.data?.totalMembers ?? 0).toLocaleString()
          }
          delta={
            activeMembersQuery.data
              ? formatDeltaLabel(activeMembersQuery.data.deltaPct)
              : undefined
          }
          deltaTone={toneFromDelta(activeMembersQuery.data?.deltaPct)}
          hint="new members MoM"
          icon={Users}
        />

        <StatCard
          label="Trading Volume"
          value={
            tradingVolumeQuery.isLoading
              ? "..."
              : formatCurrencyCompact(tradingVolumeQuery.data?.totalVolumeAllTime ?? 0)
          }
          delta={
            tradingVolumeQuery.data
              ? formatDeltaLabel(tradingVolumeQuery.data.volumeDeltaPct)
              : undefined
          }
          deltaTone={toneFromDelta(tradingVolumeQuery.data?.volumeDeltaPct)}
          hint="MoM"
          icon={DollarSign}
        />

        <StatCard
          label="Trades Executed"
          value={
            tradingVolumeQuery.isLoading
              ? "..."
              : (tradingVolumeQuery.data?.totalTradesAllTime ?? 0).toLocaleString()
          }
          delta={
            tradingVolumeQuery.data
              ? formatDeltaLabel(tradingVolumeQuery.data.tradesDeltaPct)
              : undefined
          }
          deltaTone={toneFromDelta(tradingVolumeQuery.data?.tradesDeltaPct)}
          hint="MoM"
          icon={Activity}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trading Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {tradingVolumeQuery.isLoading ? (
              <StatePanel text="Loading trading volume..." />
            ) : tradingVolumeQuery.isError ? (
              <StatePanel text="Unable to load trading volume." error />
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="volume" name="Volume ($)" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="trades" name="Trades" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {sectorAllocationQuery.isLoading ? (
              <StatePanel text="Loading sector data..." />
            ) : sectorAllocationQuery.isError ? (
              <StatePanel text="Unable to load sector allocation." error />
            ) : sectorAllocation.length === 0 ? (
              <StatePanel text="No listed stocks yet." />
            ) : (
              <>
                <div className="h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        dataKey="percentage"
                        nameKey="sector"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {sectorAllocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  {sectorAllocation.map((s, i) => (
                    <div key={s.sector} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground flex-1">{s.sector}</span>
                      <span className="font-medium">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Stocks by Trades (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            {topStocksQuery.isLoading ? (
              <StatePanel text="Loading top stocks..." />
            ) : topStocksQuery.isError ? (
              <StatePanel text="Unable to load top stocks." error />
            ) : topStocks.length === 0 ? (
              <StatePanel text="No trades in the last 24 hours." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={topStocks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="ticker"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="trades" name="Trades" radius={[0, 6, 6, 0]} fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Members Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {activeMembersQuery.isLoading ? (
              <StatePanel text="Loading member trend..." />
            ) : activeMembersQuery.isError ? (
              <StatePanel text="Unable to load member trend." error />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={monthlyNewMembers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="New members"
                      stroke="#1E3A8A"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function StatePanel({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <div
      className={`grid h-52 place-items-center rounded-md border border-dashed px-6 text-center text-sm ${
        error ? "border-loss/30 bg-loss/10 text-loss" : "text-muted-foreground"
      }`}
    >
      {text}
    </div>
  );
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDeltaLabel(deltaPct: number) {
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${deltaPct}% MoM`;
}

function toneFromDelta(deltaPct?: number): "profit" | "loss" | "neutral" {
  if (deltaPct === undefined) return "neutral";
  if (deltaPct > 0) return "profit";
  if (deltaPct < 0) return "loss";
  return "neutral";
}