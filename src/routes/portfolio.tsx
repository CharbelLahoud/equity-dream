import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell, StatCard } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Percent,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  getPortfolio,
  getPortfolioSummary,
  type PortfolioHolding,
} from "@/services/portfolio.service";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio · Meridian Trading" },
      {
        name: "description",
        content: "Holdings and performance of your portfolio.",
      },
      { property: "og:title", content: "Portfolio · Meridian" },
      { property: "og:description", content: "Track your holdings." },
    ],
  }),
  component: PortfolioPage,
});

const PIE_COLORS = [
  "#1E3A8A",
  "#22C55E",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#94A3B8",
  "#8B5CF6",
];

function PortfolioPage() {
  const {
    data: holdingsResponse,
    isLoading: holdingsLoading,
    isError: holdingsError,
    refetch: refetchHoldings,
  } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolio,
    retry: false,
  });

  const { data: summary } = useQuery({
    queryKey: ["portfolio", "summary"],
    queryFn: getPortfolioSummary,
    retry: false,
  });

  const holdings: PortfolioHolding[] = Array.isArray(holdingsResponse)
    ? holdingsResponse
    : [];

  const totalValue = summary?.totalValue ?? 0;
  const totalCost = summary?.totalCost ?? 0;
  const totalProfitLoss = summary?.totalProfitLoss ?? 0;
  const totalProfitLossPct = summary?.totalProfitLossPct ?? 0;
  const totalPositions = summary?.totalPositions ?? holdings.length;

  // Real allocation, derived directly from each holding's real sector
  // (now returned by the backend) — not a fabricated chart.
  const sectorAllocation = useMemo(() => {
    if (totalValue <= 0) return [];

    const bySector = new Map<string, number>();

    holdings.forEach((holding) => {
      const sector = holding.sector || "Uncategorized";

      bySector.set(
        sector,
        (bySector.get(sector) ?? 0) + holding.marketValue,
      );
    });

    return Array.from(bySector.entries())
      .map(([name, value]) => ({
        name,
        value,
        pct: (value / totalValue) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [holdings, totalValue]);

  return (
    <AppShell
      title="Portfolio"
      subtitle="Your holdings and performance."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Value"
          value={formatCurrency(totalValue)}
          hint="Current market value"
          icon={Wallet}
        />

        <StatCard
          label="Total Cost"
          value={formatCurrency(totalCost)}
          hint="Invested capital"
          icon={Percent}
        />

        <StatCard
          label="Unrealized P&L"
          value={`${totalProfitLoss >= 0 ? "+" : ""}${formatCurrency(
            totalProfitLoss,
          )}`}
          delta={`${totalProfitLoss >= 0 ? "+" : ""}${totalProfitLossPct.toFixed(2)}%`}
          deltaTone={totalProfitLoss >= 0 ? "profit" : "loss"}
          icon={totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
        />

        <StatCard
          label="Positions"
          value={String(totalPositions)}
          hint="Open holdings"
          icon={Briefcase}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Holdings</CardTitle>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {holdingsLoading ? (
              <StatePanel text="Loading portfolio..." />
            ) : holdingsError ? (
              <StatePanel
                text="Unable to load portfolio."
                error
                action={
                  <Button
                    variant="outline"
                    onClick={() => void refetchHoldings()}
                  >
                    Try again
                  </Button>
                }
              />
            ) : holdings.length === 0 ? (
              <StatePanel text="No open positions yet. Buy a stock to see it here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Name
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Shares
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Avg Price
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Market Price
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Value
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        P&L
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Allocation
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.map((holding) => {
                      const up = holding.profitLoss >= 0;
                      const allocationPct =
                        totalValue > 0
                          ? (holding.marketValue / totalValue) * 100
                          : 0;

                      return (
                        <tr
                          key={holding.stockId}
                          className="border-t hover:bg-muted/30"
                        >
                          <td className="px-6 py-3 font-semibold">
                            {holding.ticker}
                          </td>

                          <td className="px-4 py-3 text-muted-foreground">
                            {holding.companyName || "—"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {holding.shares}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(holding.averagePrice)}
                          </td>

                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(holding.currentPrice)}
                          </td>

                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(holding.marketValue)}
                          </td>

                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              up ? "text-profit" : "text-loss"
                            }`}
                          >
                            <div className="flex items-center justify-end gap-1">
                              {up ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {up ? "+" : ""}
                              {formatCurrency(holding.profitLoss)}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={allocationPct}
                                className="h-1.5 w-24"
                              />
                              <span className="w-10 text-xs text-muted-foreground">
                                {allocationPct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>

          <CardContent>
            {sectorAllocation.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No holdings to allocate yet.
              </div>
            ) : (
              <>
                <div className="h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {sectorAllocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  {sectorAllocation.map((sector, i) => (
                    <div key={sector.name} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="flex-1 truncate text-muted-foreground">
                        {sector.name}
                      </span>
                      <span className="font-medium">
                        {sector.pct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
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
      <Briefcase className="h-8 w-8" />
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