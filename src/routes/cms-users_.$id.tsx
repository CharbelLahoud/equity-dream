import axios from "axios";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCmsUserById, reinstateCmsUser, suspendCmsUser } from "@/services/cms-user";
export const Route = createFileRoute("/cms-users_/$id")({
  component: CmsUserDetailsPage,
});

function CmsUserDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = Route.useParams();
  const [reinstateReason, setReinstateReason] = useState("");
  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [suspensionReason, setSuspensionReason] = useState("");
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
    data: cmsUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cms-user", id],
    queryFn: () => getCmsUserById(id),
    enabled: isCmsAuthenticated,
    retry: false,
  });

  const suspendMutation = useMutation({
    mutationFn: () => suspendCmsUser(id, suspensionReason.trim()),

    onSuccess: async (data) => {
      setSuccessMessage(data.message);
      setErrorMessage("");
      setSuspensionReason("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cms-user", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["cms-users"],
        }),
      ]);
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || "Failed to suspend CMS user.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("CMS user suspension failed:", error);
    },
  });
  const reinstateMutation = useMutation({
    mutationFn: () => reinstateCmsUser(id, reinstateReason.trim()),

    onSuccess: async (data) => {
      setSuccessMessage(data.message);
      setErrorMessage("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["cms-user", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["cms-users"],
        }),
      ]);
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || "Failed to reinstate CMS user.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("CMS user reinstatement failed:", error);
    },
  });
  function handleSuspend() {
    setSuccessMessage("");
    setErrorMessage("");

    if (!suspensionReason.trim()) {
      setErrorMessage("Suspension reason is required.");
      return;
    }

    suspendMutation.mutate();
  }

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
    <AppShell
      title="CMS User Details"
      subtitle="View and manage administrative account information."
    >
      <Button
        variant="outline"
        className="mb-4"
        onClick={() =>
          navigate({
            to: "/cms-users",
          })
        }
      >
        Back to CMS users
      </Button>

      {isLoading && <p className="text-sm text-muted-foreground">Loading CMS user...</p>}

      {isError && <p className="text-sm text-loss">Failed to load CMS user.</p>}

      {cmsUser && (
        <Card>
          <CardHeader>
            <CardTitle>{cmsUser.fullName}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>

              <p className="mt-1 text-sm font-medium">{cmsUser.email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">User ID</p>

              <p className="mt-1 break-all font-mono text-sm">{cmsUser._id}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Role</p>

              <Badge variant="outline" className="mt-1">
                {cmsUser.role}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>

              <Badge
                variant="outline"
                className={
                  cmsUser.status === "ACTIVE"
                    ? "mt-1 border-profit/20 bg-profit/10 text-profit"
                    : cmsUser.status === "SUSPENDED"
                      ? "mt-1 border-loss/20 bg-loss/10 text-loss"
                      : "mt-1 border-gold/30 bg-gold/10 text-gold"
                }
              >
                {cmsUser.status}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Password status</p>

              <p className="mt-1 text-sm font-medium">
                {cmsUser.isTemporaryPassword ? "Temporary password" : "Password changed"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Last login</p>

              <p className="mt-1 text-sm font-medium">
                {cmsUser.lastLoginAt ? new Date(cmsUser.lastLoginAt).toLocaleString() : "Never"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Created</p>

              <p className="mt-1 text-sm font-medium">
                {new Date(cmsUser.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Updated</p>

              <p className="mt-1 text-sm font-medium">
                {new Date(cmsUser.updatedAt).toLocaleString()}
              </p>
            </div>

            {cmsUser.status !== "SUSPENDED" && (
              <div className="space-y-3 border-t pt-6 sm:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="suspensionReason">Suspension reason</Label>

                  <Input
                    id="suspensionReason"
                    value={suspensionReason}
                    onChange={(event) => setSuspensionReason(event.target.value)}
                    placeholder="Enter the reason for suspending this account"
                    maxLength={500}
                  />
                </div>

                {successMessage && <p className="text-sm text-profit">{successMessage}</p>}

                {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

                <Button
                  type="button"
                  className="bg-loss text-white hover:bg-loss/90"
                  disabled={suspendMutation.isPending}
                  onClick={handleSuspend}
                >
                  {suspendMutation.isPending ? "Suspending..." : "Suspend CMS user"}
                </Button>
              </div>
            )}

            {cmsUser.status === "SUSPENDED" && (
              <div className="space-y-3 border-t pt-6 sm:col-span-2">
                <p className="text-sm text-loss">This CMS account is suspended.</p>

                <div className="space-y-2">
                  <Label htmlFor="reinstateReason">Reinstatement reason</Label>

                  <Input
                    id="reinstateReason"
                    value={reinstateReason}
                    onChange={(event) => setReinstateReason(event.target.value)}
                    placeholder="Enter the reason for reinstating this account"
                    maxLength={500}
                  />
                </div>

                {successMessage && <p className="text-sm text-profit">{successMessage}</p>}

                {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

                <Button
                  type="button"
                  disabled={reinstateMutation.isPending || !reinstateReason.trim()}
                  onClick={() => reinstateMutation.mutate()}
                >
                  {reinstateMutation.isPending ? "Reinstating..." : "Reinstate CMS user"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
