import {
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Briefcase,
  ClipboardList,
  ArrowLeftRight,
  Bell,
  BarChart3,
  Shield,
  UserCog,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  User,
  TrendingUp,
  Users,
} from "lucide-react";

import { api } from "@/services/api";
import { getMyProfile } from "@/services/members.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CmsRole =
  | "ADMINISTRATOR"
  | "SUPPORT_AGENT"
  | "ANALYST";

type CmsUser = {
  id: string;
  fullName: string;
  email: string;
  userType: "CMS";
  role: CmsRole;
  status: string;
};

const nav = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/stocks",
    label: "Stocks",
    icon: LineChart,
  },
  {
    to: "/portfolio",
    label: "Portfolio",
    icon: Briefcase,
  },
  {
    to: "/wallet",
    label: "Wallet",
    icon: Wallet,
  },
  {
    to: "/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    to: "/admin",
    label: "Admin",
    icon: Shield,
  },
  {
    to: "/members",
    label: "Members",
    icon: Users,
  },
  {
    to: "/cms-users",
    label: "CMS Users",
    icon: UserCog,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

// ---- NYSE market status (regular hours: 9:30am-4:00pm ET, Mon-Fri) ----
// Note: does not account for NYSE holidays (e.g. Labor Day, Thanksgiving).

const WEEKDAY_ORDER = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
const MARKET_OPEN_MINUTES = 9 * 60 + 30; // 9:30am
const MARKET_CLOSE_MINUTES = 16 * 60; // 4:00pm

type MarketStatus = {
  isOpen: boolean;
  countdownLabel: string;
};

function getEasternTimeParts(
  date: Date,
) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const parts =
    formatter.formatToParts(date);

  const map: Record<string, string> =
    {};

  for (const part of parts) {
    map[part.type] = part.value;
  }

  return {
    weekday: map.weekday,
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
  };
}

function formatDuration(
  totalMinutes: number,
) {
  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

function computeMarketStatus(
  now: Date,
): MarketStatus {
  const { weekday, hour, minute } =
    getEasternTimeParts(now);

  const dayIndex =
    WEEKDAY_ORDER.indexOf(weekday);

  const minutesNow = hour * 60 + minute;

  const isWeekday =
    dayIndex >= 1 && dayIndex <= 5;

  const isOpen =
    isWeekday &&
    minutesNow >= MARKET_OPEN_MINUTES &&
    minutesNow < MARKET_CLOSE_MINUTES;

  if (isOpen) {
    const minutesUntilClose =
      MARKET_CLOSE_MINUTES - minutesNow;

    return {
      isOpen: true,
      countdownLabel: `Closes in ${formatDuration(minutesUntilClose)}`,
    };
  }

  // Find the next weekday open time, starting from today.
  for (
    let offset = 0;
    offset <= 7;
    offset++
  ) {
    const candidateDayIndex =
      (dayIndex + offset) % 7;

    const candidateIsWeekday =
      candidateDayIndex >= 1 &&
      candidateDayIndex <= 5;

    if (!candidateIsWeekday) continue;

    const candidateOpenMinutes =
      offset * 24 * 60 +
      MARKET_OPEN_MINUTES;

    if (
      candidateOpenMinutes >
      minutesNow
    ) {
      return {
        isOpen: false,
        countdownLabel: `Opens in ${formatDuration(candidateOpenMinutes - minutesNow)}`,
      };
    }
  }

  return {
    isOpen: false,
    countdownLabel: "Opens soon",
  };
}

function useMarketStatus(): MarketStatus {
  const [status, setStatus] =
    useState<MarketStatus>(() =>
      computeMarketStatus(new Date()),
    );

  useEffect(() => {
    const interval = setInterval(
      () => {
        setStatus(
          computeMarketStatus(
            new Date(),
          ),
        );
      },
      60 * 1000,
    );

    return () =>
      clearInterval(interval);
  }, []);

  return status;
}

export function AppShell({
  children,
  title,
  subtitle,
}: AppShellProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [token, setToken] =
    useState<string | null>(null);

  const [userType, setUserType] =
    useState<string | null>(null);

  const [cmsUser, setCmsUser] =
    useState<CmsUser | null>(null);

  const [isSessionReady, setIsSessionReady] =
    useState(false);

  const pathname = useRouterState({
    select: (state) =>
      state.location.pathname,
  });

  const marketStatus = useMarketStatus();

  useEffect(() => {
  const storedToken =
    localStorage.getItem("accessToken") ??
    sessionStorage.getItem("accessToken");

  const storedCmsUser =
    sessionStorage.getItem("cmsUser");

  const storedUserType =
    sessionStorage.getItem("userType");

  let parsedCmsUser: CmsUser | null = null;

  if (storedCmsUser) {
    try {
      parsedCmsUser = JSON.parse(
        storedCmsUser,
      ) as CmsUser;
    } catch {
      sessionStorage.removeItem("cmsUser");
    }
  }

  const resolvedUserType =
    storedUserType ??
    (parsedCmsUser
      ? "CMS"
      : storedToken
        ? "MEMBER"
        : null);

  setToken(storedToken);
  setUserType(resolvedUserType);
  setCmsUser(parsedCmsUser);
  setIsSessionReady(true);
}, []);

  const {
    data: member,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled:
      isSessionReady &&
      Boolean(token) &&
      userType === "MEMBER",
    retry: false,
  });

  const currentName =
    userType === "CMS"
      ? cmsUser?.fullName
      : member?.fullName;

  const currentEmail =
    userType === "CMS"
      ? cmsUser?.email
      : member?.email;

  const currentInitials =
    currentName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    (userType === "CMS" ? "C" : "M");

  const accountDescription =
    userType === "CMS"
      ? cmsUser
        ? `${cmsUser.role.replaceAll("_", " ")} · ${cmsUser.status.replaceAll("_", " ")}`
        : "CMS Account"
      : member
        ? `${member.status.replaceAll("_", " ")} · ${member.identityVerificationStatus.replaceAll("_", " ")}`
        : "Member Account";

  function canDisplayNavItem(
    item: (typeof nav)[number],
  ) {
    const isCms =
      userType === "CMS";

    const isMember =
      userType === "MEMBER";

    if (item.to === "/") {
      return isMember;
    }

    if (
      item.to === "/portfolio" ||
      item.to === "/wallet" ||
      item.to === "/orders" ||
      item.to === "/transactions"
    ) {
      return isMember;
    }

    if (item.to === "/admin") {
      return isCms;
    }

    if (item.to === "/members") {
      return (
        isCms &&
        (cmsUser?.role ===
          "ADMINISTRATOR" ||
          cmsUser?.role ===
            "SUPPORT_AGENT")
      );
    }

    if (item.to === "/cms-users") {
      return (
        isCms &&
        cmsUser?.role ===
          "ADMINISTRATOR"
      );
    }

    return true;
  }

  async function handleLogout() {
    await Promise.all([
      queryClient.cancelQueries({
        queryKey: ["my-profile"],
      }),
      queryClient.cancelQueries({
        queryKey: ["members"],
      }),
      queryClient.cancelQueries({
        queryKey: ["member"],
      }),
      queryClient.cancelQueries({
        queryKey: ["cms-users"],
      }),
      queryClient.cancelQueries({
        queryKey: ["cms-user"],
      }),
    ]);

    try {
      if (userType === "CMS") {
        await api.post(
          "/auth/cms/logout",
        );
      } else {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error(
        "Backend logout failed:",
        error,
      );
    } finally {
      localStorage.removeItem(
        "accessToken",
      );

      sessionStorage.removeItem(
        "accessToken",
      );

      sessionStorage.removeItem(
        "userType",
      );

      sessionStorage.removeItem(
        "cmsUser",
      );

      sessionStorage.removeItem(
        "cmsEmail",
      );

      sessionStorage.removeItem(
        "cmsTemporaryPassword",
      );

      queryClient.removeQueries({
        queryKey: ["my-profile"],
      });

      queryClient.removeQueries({
        queryKey: ["cms-users"],
      });

      queryClient.removeQueries({
        queryKey: ["cms-user"],
      });

      queryClient.removeQueries({
        queryKey: ["members"],
      });

      queryClient.removeQueries({
        queryKey: ["member"],
      });

      setToken(null);
      setUserType(null);
      setCmsUser(null);

      await navigate({
        to:
          userType === "CMS"
            ? "/cms-login"
            : "/login",
      });
    }
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">
              Meridian
            </div>

            <div className="text-[11px] text-sidebar-foreground/60">
              Trading Platform
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {nav
            .filter(canDisplayNavItem)
            .map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to ||
                    pathname.startsWith(
                      `${item.to}/`,
                    );

              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />

                  <span className="truncate">
                    {item.label}
                  </span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-gold" />
                  )}
                </Link>
              );
            })}
        </nav>

        <div className="absolute inset-x-3 bottom-4 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                marketStatus.isOpen
                  ? "animate-pulse bg-profit"
                  : "bg-sidebar-foreground/30",
              )}
            />
            {marketStatus.isOpen
              ? "Markets Open · NYSE"
              : "Markets Closed · NYSE"}
          </div>

          <div className="mt-2 text-[11px] text-sidebar-foreground/50">
            {marketStatus.countdownLabel}
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search stocks, symbols, news..."
              className="border-transparent bg-muted/40 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() =>
                navigate({
                  to: "/notifications",
                })
              }
            >
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md p-1 hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {currentInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden text-left sm:block">
                    <div className="text-sm font-medium leading-tight">
                      {!isSessionReady
                        ? "Loading..."
                        : userType === "CMS"
                          ? currentName ||
                            "CMS User"
                          : isLoading
                            ? "Loading..."
                            : isError
                              ? "Member"
                              : currentName ||
                                "Member"}
                    </div>

                    <div className="max-w-52 truncate text-[11px] text-muted-foreground">
                      {accountDescription}
                    </div>
                  </div>

                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64"
              >
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <div>My Account</div>

                    {currentEmail && (
                      <div className="truncate text-xs font-normal text-muted-foreground">
                        {currentEmail}
                      </div>
                    )}

                    {userType === "CMS" &&
                      cmsUser && (
                        <div className="text-xs font-normal text-muted-foreground">
                          {cmsUser.role.replaceAll(
                            "_",
                            " ",
                          )}
                        </div>
                      )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {userType !== "CMS" && (
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to: "/profile",
                      })
                    }
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    navigate({
                      to: "/settings",
                    })
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-loss"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-profit/30 bg-profit/10 text-profit"
              >
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-profit" />
                Live
              </Badge>

              <Badge variant="outline">
                USD
              </Badge>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaTone?:
    | "profit"
    | "loss"
    | "neutral";
  hint?: string;
  icon?: ComponentType<{
    className?: string;
  }>;
};

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  hint,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="card-elev p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>

        {Icon && (
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={cn(
              "font-medium",
              deltaTone === "profit" &&
                "text-profit",
              deltaTone === "loss" &&
                "text-loss",
              deltaTone === "neutral" &&
                "text-muted-foreground",
            )}
          >
            {delta}
          </span>
        )}

        {hint && (
          <span className="text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}