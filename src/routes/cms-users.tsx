function RouteComponent() {
  return <div>Hello "/cms-users"!</div>;
}
import axios from "axios";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createCmsUser, getCmsUsers, type CmsRole } from "@/services/cms-user";

export const Route = createFileRoute("/cms-users")({
  component: CmsUsersPage,
});

function CmsUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [search, setSearch] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CmsRole>("SUPPORT_AGENT");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
useEffect(() => {
  const token = sessionStorage.getItem("accessToken");
  const userType = sessionStorage.getItem("userType");
  const storedCmsUser = sessionStorage.getItem("cmsUser");

  if (!token || userType !== "CMS" || !storedCmsUser) {
    navigate({ to: "/cms-login" });
    return;
  }

  try {
    const cmsUser = JSON.parse(storedCmsUser);

    if (cmsUser.role !== "ADMINISTRATOR") {
      navigate({ to: "/admin" });
      return;
    }
  } catch {
    sessionStorage.removeItem("cmsUser");
    navigate({ to: "/cms-login" });
    return;
  }

  setIsCmsAuthenticated(true);
  setIsCheckingSession(false);
}, [navigate]);

  const {
    data: cmsUsersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-users"],
    queryFn: getCmsUsers,
    enabled: isCmsAuthenticated,
    retry: false,
  });

  const createCmsUserMutation = useMutation({
    mutationFn: createCmsUser,

    onSuccess: async (data) => {
      setSuccessMessage(`${data.message}. Check the NestJS terminal for the temporary password.`);
      setErrorMessage("");

      setFullName("");
      setEmail("");
      setRole("SUPPORT_AGENT");

      await queryClient.invalidateQueries({
        queryKey: ["cms-users"],
      });
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || "Failed to create CMS user.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("CMS user creation failed:", error);
    },
  });

  function handleCreateCmsUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Email address is required.");
      return;
    }

    createCmsUserMutation.mutate({
      fullName: trimmedFullName,
      email: trimmedEmail,
      role,
    });
  }

  const cmsUsers = cmsUsersResponse?.items ?? [];

  const filteredCmsUsers = cmsUsers.filter((cmsUser) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      cmsUser.fullName.toLowerCase().includes(searchText) ||
      cmsUser.email.toLowerCase().includes(searchText) ||
      cmsUser.role.toLowerCase().includes(searchText)
    );
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
    <AppShell title="CMS Users" subtitle="View and manage platform administrative accounts.">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invite CMS User</CardTitle>

          <p className="text-xs text-muted-foreground">
            Create an administrative account with a temporary password.
          </p>
        </CardHeader>

        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleCreateCmsUser}>
            <div className="space-y-2">
              <Label htmlFor="cmsFullName">Full name</Label>

              <Input
                id="cmsFullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="New CMS User"
                minLength={2}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cmsEmail">Email address</Label>

              <Input
                id="cmsEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cmsRole">Role</Label>

              <select
                id="cmsRole"
                value={role}
                onChange={(event) => setRole(event.target.value as CmsRole)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ADMINISTRATOR">Administrator</option>

                <option value="ANALYST">Analyst</option>

                <option value="SUPPORT_AGENT">Support Agent</option>
              </select>
            </div>

            {successMessage && (
              <p className="text-sm text-profit md:col-span-3">{successMessage}</p>
            )}

            {errorMessage && <p className="text-sm text-loss md:col-span-3">{errorMessage}</p>}

            <div className="md:col-span-3">
              <Button type="submit" disabled={createCmsUserMutation.isPending}>
                {createCmsUserMutation.isPending ? "Creating CMS user..." : "Create CMS user"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>CMS User Accounts</CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                {cmsUsersResponse
                  ? `${cmsUsersResponse.meta.total} total CMS users`
                  : "Administrative and support accounts"}
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search CMS users..."
                className="h-9 w-full pl-9 sm:w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading CMS users...</p>}

          {isError && <p className="p-6 text-sm text-loss">Failed to load CMS users.</p>}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">CMS User</th>

                    <th className="px-4 py-3 text-left font-medium">Role</th>

                    <th className="px-4 py-3 text-left font-medium">Status</th>

                    <th className="px-4 py-3 text-left font-medium">Password</th>

                    <th className="px-4 py-3 text-left font-medium">Last Login</th>

                    <th className="px-6 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCmsUsers.map((cmsUser) => {
                    const initials = cmsUser.fullName
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={cmsUser._id}
                        className="cursor-pointer border-t hover:bg-muted/30"
                        onClick={() =>
                          navigate({
                            to: "/cms-users/$id",
                            params: {
                              id: cmsUser._id,
                            },
                          })
                        }
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="font-medium">{cmsUser.fullName}</div>

                              <div className="text-xs text-muted-foreground">{cmsUser.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="outline">{cmsUser.role}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              cmsUser.status === "ACTIVE"
                                ? "border-profit/20 bg-profit/10 text-profit"
                                : cmsUser.status === "SUSPENDED"
                                  ? "border-loss/20 bg-loss/10 text-loss"
                                  : "border-gold/30 bg-gold/10 text-gold"
                            }
                          >
                            {cmsUser.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          {cmsUser.isTemporaryPassword ? "Temporary" : "Changed"}
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {cmsUser.lastLoginAt
                            ? new Date(cmsUser.lastLoginAt).toLocaleString()
                            : "Never"}
                        </td>

                        <td className="px-6 py-3 text-muted-foreground">
                          {new Date(cmsUser.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredCmsUsers.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No CMS users found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
