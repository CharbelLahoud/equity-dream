import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getMembers } from "@/services/member";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/members")({
  component: MembersPage,
});

function MembersPage() {
  const navigate = useNavigate();

  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [identityStatus, setIdentityStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;
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
      const canManageMembers = cmsUser.role === "ADMINISTRATOR" || cmsUser.role === "SUPPORT_AGENT";

      if (!canManageMembers) {
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
    data: membersResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["members", search, status, identityStatus, page, limit],
    queryFn: () =>
      getMembers({
        search: search.trim() || undefined,
        status: status || undefined,
        identityVerificationStatus: identityStatus || undefined,
        page,
        limit,
      }),
    enabled: isCmsAuthenticated,
    retry: false,
  });

  const members = membersResponse?.data ?? [];

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking CMS session...</p>
      </div>
    );
  }

  if (!isCmsAuthenticated) {
    return null;
  }

  return (
    <AppShell title="Members Management" subtitle="View and manage registered platform members.">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Members</CardTitle>

              <p className="mt-1 text-xs text-muted-foreground">
                {membersResponse
                  ? `${membersResponse.meta.total} total members`
                  : "Registered platform members"}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, or National ID"
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All account statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING_EMAIL_VERIFICATION">Pending email verification</option>
                <option value="PENDING_PASSWORD_SETUP">Pending password setup</option>
              </select>

              <select
                value={identityStatus}
                onChange={(event) => setIdentityStatus(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All identity statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading members...</p>}

          {isError && <p className="p-6 text-sm text-loss">Failed to load members.</p>}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Member</th>

                    <th className="px-4 py-3 text-left font-medium">Status</th>

                    <th className="px-4 py-3 text-left font-medium">Identity</th>

                    <th className="px-4 py-3 text-left font-medium">Email verified</th>

                    <th className="px-4 py-3 text-left font-medium">National ID</th>

                    <th className="px-6 py-3 text-left font-medium">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => {
                    const initials = member.fullName
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
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
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="font-medium">{member.fullName}</div>

                              <div className="text-xs text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              member.status === "ACTIVE"
                                ? "border-profit/20 bg-profit/10 text-profit"
                                : member.status === "SUSPENDED"
                                  ? "border-loss/20 bg-loss/10 text-loss"
                                  : "border-gold/30 bg-gold/10 text-gold"
                            }
                          >
                            {member.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="outline">{member.identityVerificationStatus}</Badge>
                        </td>

                        <td className="px-4 py-3">{member.isEmailVerified ? "Yes" : "No"}</td>

                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {member.nationalId}
                        </td>

                        <td className="px-6 py-3 text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {membersResponse && membersResponse.meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Page {membersResponse.meta.page} of {membersResponse.meta.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                    >
                      Previous
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={page >= membersResponse.meta.totalPages}
                      onClick={() => setPage((current) => current + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {members.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">No members found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
