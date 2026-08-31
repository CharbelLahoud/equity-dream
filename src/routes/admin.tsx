import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  DollarSign,
  LineChart as LineIcon,
  ShieldCheck,
  Search,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { users, portfolioGrowth, stocks } from "@/lib/mock-data";
import { getCmsUsers } from "@/services/cms-user";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Meridian Trading" },
      {
        name: "description",
        content: "Manage members, stocks and platform activity.",
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
  const [cmsRole, setCmsRole] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const userType = sessionStorage.getItem("userType");
    const storedCmsUser = sessionStorage.getItem("cmsUser");

    if (!token || userType !== "CMS") {
      navigate({
        to: "/cms-login",
      });

      return;
    }

    if (storedCmsUser) {
      const cmsUser = JSON.parse(storedCmsUser);

      setCmsRole(cmsUser.role);
    }

    setIsCmsAuthenticated(true);
    setIsCheckingSession(false);
  }, [navigate]);
  const {
    data: cmsUsers,
    isLoading: isCmsUsersLoading,
    isError: isCmsUsersError,
  } = useQuery({
    queryKey: ["cms-users"],
    queryFn: getCmsUsers,
    enabled: isCmsAuthenticated && cmsRole === "ADMINISTRATOR",
    retry: false,
  });

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
    <AppShell title="Admin Dashboard" subtitle="Manage members, listings and platform activity.">
      {cmsRole === "ADMINISTRATOR" && isCmsUsersLoading && (
        <p className="mb-4 text-sm text-muted-foreground">Loading CMS users...</p>
      )}

      {cmsRole === "ADMINISTRATOR" && isCmsUsersError && (
        <p className="mb-4 text-sm text-loss">Failed to load CMS users.</p>
      )}

      {cmsRole === "ADMINISTRATOR" && cmsUsers && (
        <p className="mb-4 text-sm text-profit">Loaded {cmsUsers.meta.total} CMS users.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Members"
          value="24,318"
          delta="+412 this week"
          deltaTone="profit"
          icon={Users}
        />

        <StatCard
          label="Assets Under Mgmt"
          value="$842.5M"
          delta="+3.2% MoM"
          deltaTone="profit"
          icon={DollarSign}
        />

        <StatCard label="Listed Stocks" value="8,412" hint="12 markets" icon={LineIcon} />

        <StatCard
          label="KYC Approvals"
          value="97.4%"
          delta="+0.6pp"
          deltaTone="profit"
          icon={ShieldCheck}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Platform Activity</CardTitle>

            <Badge variant="outline" className="border-profit/30 bg-profit/10 text-profit">
              Healthy
            </Badge>
          </CardHeader>

          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={portfolioGrowth}>
                  <defs>
                    <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3} />

                      <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />

                  <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />

                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1E3A8A"
                    strokeWidth={2}
                    fill="url(#agrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {[
              {
                user: "Priya Patel",
                action: "upgraded to Premium",
                time: "12m ago",
                color: "profit",
              },
              {
                user: "David Kim",
                action: "flagged for review",
                time: "1h ago",
                color: "loss",
              },
              {
                user: "Emma Wilson",
                action: "deposited $25,000",
                time: "2h ago",
                color: "profit",
              },
              {
                user: "James Rivera",
                action: "submitted KYC",
                time: "3h ago",
                color: "muted",
              },
              {
                user: "Michael Chen",
                action: "opened 3 positions",
                time: "5h ago",
                color: "muted",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {activity.user
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </div>

                  <div className="text-[11px] text-muted-foreground">{activity.time}</div>
                </div>

                <span
                  className={`h-2 w-2 rounded-full ${
                    activity.color === "profit"
                      ? "bg-profit"
                      : activity.color === "loss"
                        ? "bg-loss"
                        : "bg-muted-foreground"
                  }`}
                />
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

              <p className="mt-1 text-xs text-muted-foreground">
                Manage user accounts and permissions.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input placeholder="Search members..." className="h-9 w-60 pl-9" />
              </div>

              <Button size="sm" className="h-9">
                <Plus className="mr-1 h-4 w-4" />
                Invite
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Member</th>

                  <th className="px-4 py-3 text-left font-medium">User ID</th>

                  <th className="px-4 py-3 text-left font-medium">Joined</th>

                  <th className="px-4 py-3 text-right font-medium">Portfolio</th>

                  <th className="px-4 py-3 text-left font-medium">Role</th>

                  <th className="px-4 py-3 text-left font-medium">Status</th>

                  <th className="px-6 py-3" />
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {user.name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="truncate font-medium">{user.name}</div>

                          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.id}</td>

                    <td className="px-4 py-3 text-muted-foreground">{user.joined}</td>

                    <td className="px-4 py-3 text-right font-medium">
                      ${user.portfolio.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          user.role === "Premium" ? "border-gold/30 bg-gold/10 text-gold" : ""
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "Active"
                            ? "border-profit/20 bg-profit/10 text-profit"
                            : user.status === "Suspended"
                              ? "border-loss/20 bg-loss/10 text-loss"
                              : "border-gold/30 bg-gold/10 text-gold"
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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

            <Button size="sm" variant="outline">
              <Plus className="mr-1 h-4 w-4" />
              Add listing
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Symbol</th>

                  <th className="px-4 py-3 text-left font-medium">Name</th>

                  <th className="px-4 py-3 text-left font-medium">Sector</th>

                  <th className="px-4 py-3 text-right font-medium">Price</th>

                  <th className="px-4 py-3 text-left font-medium">Status</th>

                  <th className="px-6 py-3" />
                </tr>
              </thead>

              <tbody>
                {stocks.slice(0, 6).map((stock) => (
                  <tr key={stock.symbol} className="border-t hover:bg-muted/30">
                    <td className="px-6 py-3 font-semibold">{stock.symbol}</td>

                    <td className="px-4 py-3 text-muted-foreground">{stock.name}</td>

                    <td className="px-4 py-3">
                      <Badge variant="outline">{stock.sector}</Badge>
                    </td>

                    <td className="px-4 py-3 text-right font-medium">${stock.price.toFixed(2)}</td>

                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="border-profit/20 bg-profit/10 text-profit"
                      >
                        Active
                      </Badge>
                    </td>

                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-7">
                        Edit
                      </Button>
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
