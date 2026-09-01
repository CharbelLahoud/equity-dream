import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LineChart as LineIcon, ShieldCheck, UserCheck, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, StatCard } from "@/components/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getCmsUsers } from "@/services/cms-user";
import { getMembers } from "@/services/members.service";
import { getStocks, type Stock } from "@/services/stocks.service";
import type { Member } from "@/types/member";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      {
        title: "Admin · Meridian Trading",
      },
      {
        name: "description",
        content: "Manage members, stocks, and platform activity.",
      },
      {
        property: "og:title",
        content: "Admin · Meridian",
      },
      {
        property: "og:description",
        content: "Administrative dashboard for platform operators.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();

  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState(false);

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [cmsRole, setCmsRole] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    const userType = sessionStorage.getItem("userType");

    const storedCmsUser = sessionStorage.getItem("cmsUser");

    if (!token || userType !== "CMS" || !storedCmsUser) {
      navigate({
        to: "/cms-login",
      });

      return;
    }

    try {
      const cmsUser = JSON.parse(storedCmsUser);

      setCmsRole(cmsUser.role);
      setIsCmsAuthenticated(true);
      setIsCheckingSession(false);
    } catch {
      sessionStorage.removeItem("cmsUser");

      navigate({
        to: "/cms-login",
      });
    }
  }, [navigate]);

  const canViewMembers = cmsRole === "ADMINISTRATOR" || cmsRole === "SUPPORT_AGENT";

  const canManageCmsUsers = cmsRole === "ADMINISTRATOR";

  const {
    data: cmsUsersResponse,
    isLoading: isCmsUsersLoading,
    isError: isCmsUsersError,
  } = useQuery({
    queryKey: ["cms-users", "admin-summary"],
    queryFn: getCmsUsers,
    enabled: isCmsAuthenticated && canManageCmsUsers,
    retry: false,
  });

  const {
    data: membersResponse,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useQuery({
    queryKey: ["members", "admin-dashboard"],
    queryFn: () =>
      getMembers({
        page: 1,
        limit: 100,
      }),
    enabled: isCmsAuthenticated && canViewMembers,
    retry: false,
  });

  const { data: activeMembersResponse } = useQuery({
    queryKey: ["members", "admin-active-total"],
    queryFn: () =>
      getMembers({
        status: "ACTIVE",
        page: 1,
        limit: 1,
      }),
    enabled: isCmsAuthenticated && canViewMembers,
    retry: false,
  });

  const { data: approvedMembersResponse } = useQuery({
    queryKey: ["members", "admin-approved-total"],
    queryFn: () =>
      getMembers({
        identityVerificationStatus: "APPROVED",
        page: 1,
        limit: 1,
      }),
    enabled: isCmsAuthenticated && canViewMembers,
    retry: false,
  });

  const { data: rejectedMembersResponse } = useQuery({
    queryKey: ["members", "admin-rejected-total"],
    queryFn: () =>
      getMembers({
        identityVerificationStatus: "REJECTED",
        page: 1,
        limit: 1,
      }),
    enabled: isCmsAuthenticated && canViewMembers,
    retry: false,
  });

  const { data: pendingMembersResponse } = useQuery({
    queryKey: ["members", "admin-pending-total"],
    queryFn: () =>
      getMembers({
        identityVerificationStatus: "PENDING",
        page: 1,
        limit: 1,
      }),
    enabled: isCmsAuthenticated && canViewMembers,
    retry: false,
  });

  const {
    data: stocksResponse,
    isLoading: isStocksLoading,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: getStocks,
    enabled: isCmsAuthenticated,
    retry: false,
    refetchInterval: 30_000,
  });

  const members = membersResponse?.data ?? [];

  const stocks: Stock[] = Array.isArray(stocksResponse) ? stocksResponse : [];

  const listedStocks = stocks.filter((stock) => stock.isListed);

  const activeMembersTotal = activeMembersResponse?.meta.total ?? 0;

  const approvedMembersTotal = approvedMembersResponse?.meta.total ?? 0;

  const rejectedMembersTotal = rejectedMembersResponse?.meta.total ?? 0;

  const pendingMembersTotal = pendingMembersResponse?.meta.total ?? 0;

  const reviewedMembersTotal = approvedMembersTotal + rejectedMembersTotal;

  const approvalRate =
    reviewedMembersTotal > 0
      ? ((approvedMembersTotal / reviewedMembersTotal) * 100).toFixed(1)
      : "0.0";

  const registrationChartData = useMemo(() => createRegistrationChartData(members), [members]);

  const recentMembers = useMemo(
    () =>
      [...members]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        )
        .slice(0, 5),
    [members],
  );

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking CMS session...</p>
      </div>
    );
  }

  if (!isCmsAuthenticated) {
    return null;
  }

  return (
    <AppShell title="Admin Dashboard" subtitle="Manage members, listings, and platform activity.">
      {canManageCmsUsers && isCmsUsersLoading && (
        <p className="mb-4 text-sm text-muted-foreground">Loading CMS users...</p>
      )}

      {canManageCmsUsers && isCmsUsersError && (
        <p className="mb-4 text-sm text-loss">Failed to load CMS users.</p>
      )}

      {canManageCmsUsers && cmsUsersResponse && (
        <p className="mb-4 text-sm text-profit">Loaded {cmsUsersResponse.meta.total} CMS users.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value={
            !canViewMembers
              ? "Restricted"
              : isMembersLoading
                ? "..."
                : String(membersResponse?.meta.total ?? 0)
          }
          hint="Registered accounts"
          icon={Users}
        />

        <StatCard
          label="Active Members"
          value={!canViewMembers ? "Restricted" : String(activeMembersTotal)}
          hint="Active platform accounts"
          icon={UserCheck}
        />

        <StatCard
          label="Listed Stocks"
          value={isStocksLoading ? "..." : String(listedStocks.length)}
          hint={`${stocks.length} total stocks`}
          icon={LineIcon}
        />

        <StatCard
          label="KYC Approval Rate"
          value={!canViewMembers ? "Restricted" : `${approvalRate}%`}
          hint={`${approvedMembersTotal} approved`}
          icon={ShieldCheck}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Member Registration Activity</CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Cumulative registrations during the last 30 days.
              </p>
            </div>

            <Badge variant="outline" className="border-profit/30 bg-profit/10 text-profit">
              Live data
            </Badge>
          </CardHeader>

          <CardContent>
            {!canViewMembers && (
              <p className="text-sm text-muted-foreground">
                Your CMS role cannot access member activity.
              </p>
            )}

            {canViewMembers && isMembersLoading && (
              <div className="grid h-64 place-items-center">
                <p className="text-sm text-muted-foreground">Loading registration activity...</p>
              </div>
            )}

            {canViewMembers && isMembersError && (
              <div className="grid h-64 place-items-center">
                <p className="text-sm text-loss">Failed to load registration activity.</p>
              </div>
            )}

            {canViewMembers && !isMembersLoading && !isMembersError && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationChartData}>
                    <defs>
                      <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />

                        <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={24}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />

                    <Tooltip
                      formatter={(value) => [Number(value), "Total members"]}
                      contentStyle={{
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#1E3A8A"
                      strokeWidth={2}
                      fill="url(#registrationGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>

            <p className="text-xs text-muted-foreground">Newest real member accounts.</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!canViewMembers && (
              <p className="text-sm text-muted-foreground">
                Member data is restricted for this role.
              </p>
            )}

            {canViewMembers && isMembersLoading && (
              <p className="text-sm text-muted-foreground">Loading recent registrations...</p>
            )}

            {canViewMembers && isMembersError && (
              <p className="text-sm text-loss">Failed to load recent registrations.</p>
            )}

            {canViewMembers &&
              !isMembersLoading &&
              !isMembersError &&
              recentMembers.map((member) => {
                const initials = getInitials(member.fullName);

                return (
                  <button
                    key={member._id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md p-1 text-left hover:bg-muted/30"
                    onClick={() =>
                      navigate({
                        to: "/members/$id",
                        params: {
                          id: member._id,
                        },
                      })
                    }
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{member.fullName}</div>

                      <div className="truncate text-[11px] text-muted-foreground">
                        Registered {formatRelativeDate(member.createdAt)}
                      </div>
                    </div>

                    <span
                      className={`h-2 w-2 rounded-full ${
                        member.status === "ACTIVE"
                          ? "bg-profit"
                          : member.status === "SUSPENDED"
                            ? "bg-loss"
                            : "bg-gold"
                      }`}
                    />
                  </button>
                );
              })}

            {canViewMembers &&
              !isMembersLoading &&
              !isMembersError &&
              recentMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">No members found.</p>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Account Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {!canViewMembers && (
              <p className="text-sm text-muted-foreground">
                Member information is restricted for this role.
              </p>
            )}

            {canViewMembers && (
              <>
                <SummaryRow label="Total members" value={membersResponse?.meta.total ?? 0} />

                <SummaryRow label="Active members" value={activeMembersTotal} />

                <SummaryRow label="Approved identities" value={approvedMembersTotal} />

                <SummaryRow label="Rejected identities" value={rejectedMembersTotal} />

                <SummaryRow label="Pending identities" value={pendingMembersTotal} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {isStocksLoading && <p className="text-sm text-muted-foreground">Loading stocks...</p>}

            {isStocksError && <p className="text-sm text-loss">Failed to load stocks.</p>}

            {!isStocksLoading && !isStocksError && (
              <>
                <SummaryRow label="Total stocks" value={stocks.length} />

                <SummaryRow label="Listed stocks" value={listedStocks.length} />

                <SummaryRow label="Delisted stocks" value={stocks.length - listedStocks.length} />

                <SummaryRow
                  label="Current prices"
                  value={stocks.filter((stock) => stock.priceStatus === "CURRENT").length}
                />

                <SummaryRow
                  label="Price errors"
                  value={stocks.filter((stock) => stock.priceStatus === "ERROR").length}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {canViewMembers && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent Members</CardTitle>

                <p className="mt-1 text-xs text-muted-foreground">
                  Real member accounts from MongoDB.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate({
                    to: "/members",
                  })
                }
              >
                View all members
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isMembersLoading && (
              <p className="p-6 text-sm text-muted-foreground">Loading members...</p>
            )}

            {isMembersError && <p className="p-6 text-sm text-loss">Failed to load members.</p>}

            {!isMembersLoading && !isMembersError && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Member</th>

                      <th className="px-4 py-3 text-left font-medium">Joined</th>

                      <th className="px-4 py-3 text-left font-medium">Email</th>

                      <th className="px-4 py-3 text-left font-medium">Identity</th>

                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentMembers.map((member) => (
                      <tr
                        key={member._id}
                        className="cursor-pointer border-t hover:bg-muted/30"
                        onClick={() =>
                          navigate({
                            to: "/members/$id",
                            params: {
                              id: member._id,
                            },
                          })
                        }
                      >
                        <td className="px-6 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {getInitials(member.fullName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <div className="truncate font-medium">{member.fullName}</div>

                              <div className="truncate font-mono text-xs text-muted-foreground">
                                {member._id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(member.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          {member.isEmailVerified ? "Verified" : "Not verified"}
                        </td>

                        <td className="px-4 py-3">
                          <IdentityBadge status={member.identityVerificationStatus} />
                        </td>

                        <td className="px-6 py-3">
                          <MemberStatusBadge status={member.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {recentMembers.length === 0 && (
                  <p className="p-6 text-center text-sm text-muted-foreground">No members found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Stock Management</CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                Current stock data from the backend.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/stocks",
                })
              }
            >
              Manage stocks
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isStocksLoading && (
            <p className="p-6 text-sm text-muted-foreground">Loading stocks...</p>
          )}

          {isStocksError && <p className="p-6 text-sm text-loss">Failed to load stocks.</p>}

          {!isStocksLoading && !isStocksError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Ticker</th>

                    <th className="px-4 py-3 text-left font-medium">Company</th>

                    <th className="px-4 py-3 text-left font-medium">Sector</th>

                    <th className="px-4 py-3 text-right font-medium">Price</th>

                    <th className="px-4 py-3 text-left font-medium">Source</th>

                    <th className="px-4 py-3 text-left font-medium">Price status</th>

                    <th className="px-6 py-3 text-left font-medium">Listing</th>
                  </tr>
                </thead>

                <tbody>
                  {stocks.slice(0, 6).map((stock) => (
                    <tr key={stock._id} className="border-t hover:bg-muted/30">
                      <td className="px-6 py-3 font-semibold">{stock.ticker}</td>

                      <td className="px-4 py-3 text-muted-foreground">{stock.companyName}</td>

                      <td className="px-4 py-3">
                        <Badge variant="outline">{stock.sector || "Uncategorized"}</Badge>
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(stock.currentPrice)}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {stock.priceSource ?? "Unknown"}
                      </td>

                      <td className="px-4 py-3">
                        <PriceStatusBadge status={stock.priceStatus} />
                      </td>

                      <td className="px-6 py-3">
                        <Badge
                          variant="outline"
                          className={
                            stock.isListed
                              ? "border-profit/20 bg-profit/10 text-profit"
                              : "border-loss/20 bg-loss/10 text-loss"
                          }
                        >
                          {stock.isListed ? "Listed" : "Delisted"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stocks.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No stocks found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function createRegistrationChartData(members: Member[]) {
  const today = startOfDay(new Date());

  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - 29);

  const membersBeforeRange = members.filter((member) => {
    const createdAt = new Date(member.createdAt);

    return createdAt < firstDay;
  }).length;

  let cumulativeTotal = membersBeforeRange;

  return Array.from(
    {
      length: 30,
    },
    (_, index) => {
      const date = new Date(firstDay);

      date.setDate(firstDay.getDate() + index);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const registeredOnDate = members.filter((member) => {
        const createdAt = new Date(member.createdAt);

        return createdAt >= date && createdAt < nextDate;
      }).length;

      cumulativeTotal += registeredOnDate;

      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        total: cumulativeTotal,
        registrations: registeredOnDate,
      };
    },
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>

      <Badge variant="outline">{value}</Badge>
    </div>
  );
}

function MemberStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "ACTIVE"
          ? "border-profit/20 bg-profit/10 text-profit"
          : status === "SUSPENDED"
            ? "border-loss/20 bg-loss/10 text-loss"
            : "border-gold/30 bg-gold/10 text-gold"
      }
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

function IdentityBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "APPROVED"
          ? "border-profit/20 bg-profit/10 text-profit"
          : status === "REJECTED"
            ? "border-loss/20 bg-loss/10 text-loss"
            : "border-gold/30 bg-gold/10 text-gold"
      }
    >
      {status}
    </Badge>
  );
}

function PriceStatusBadge({ status }: { status?: string }) {
  const displayedStatus = status ?? "UNKNOWN";

  return (
    <Badge
      variant="outline"
      className={
        displayedStatus === "CURRENT"
          ? "border-profit/20 bg-profit/10 text-profit"
          : displayedStatus === "ERROR"
            ? "border-loss/20 bg-loss/10 text-loss"
            : "border-gold/30 bg-gold/10 text-gold"
      }
    >
      {displayedStatus}
    </Badge>
  );
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatRelativeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const difference = Date.now() - date.getTime();

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}
