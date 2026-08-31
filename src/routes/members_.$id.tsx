import axios from "axios";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMemberById,
  reviewMemberIdentity,
  suspendMember,
  reinstateMember,
  type ReviewMemberIdentityDto,
} from "@/services/member";

export const Route = createFileRoute("/members_/$id")({
  component: MemberDetailsPage,
});


function MemberDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = Route.useParams();

  const [isCmsAuthenticated, setIsCmsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [reinstateReason, setReinstateReason] = useState("");
  const [cmsRole, setCmsRole] = useState<string | null>(null);
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

      if (cmsUser.role !== "ADMINISTRATOR" && cmsUser.role !== "SUPPORT_AGENT") {
        navigate({ to: "/admin" });
        return;
      }

      setCmsRole(cmsUser.role);
    } catch {
      navigate({ to: "/cms-login" });
      return;
    }

    setIsCmsAuthenticated(true);
    setIsCheckingSession(false);
  }, [navigate]);

  const {
    data: member,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMemberById(id),
    enabled: isCmsAuthenticated,
    retry: false,
  });

  const identityMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewMemberIdentityDto }) =>
      reviewMemberIdentity(id, dto),

    onSuccess: async () => {
      setSuccessMessage("Identity status updated successfully.");
      setErrorMessage("");
      setRejectionReason("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["member", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["members"],
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
            : backendMessage || "Failed to update identity status.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Identity review failed:", error);
    },
  });
  const suspendMutation = useMutation({
    mutationFn: suspendMember,

    onSuccess: async () => {
      setSuccessMessage("Member suspended successfully.");
      setErrorMessage("");
      setSuspensionReason("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["member", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["members"],
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
            : backendMessage || "Failed to suspend member.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    },
  });
  const reinstateMutation = useMutation({
    mutationFn: reinstateMember,

    onSuccess: async () => {
      setSuccessMessage("Member reinstated successfully.");
      setErrorMessage("");
      setReinstateReason("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["member", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["members"],
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
            : backendMessage || "Failed to reinstate member.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    },
  });
  function handleApprove() {
    setSuccessMessage("");
    setErrorMessage("");

    identityMutation.mutate({
      id,
      dto: {
        status: "APPROVED",
      },
    });
  }

  function handleReject() {
    setSuccessMessage("");
    setErrorMessage("");

    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setErrorMessage("Rejection reason is required.");
      return;
    }

    identityMutation.mutate({
      id,
      dto: {
        status: "REJECTED",
        rejectionReason: trimmedReason,
      },
    });
  }
  function handleSuspend() {
    setSuccessMessage("");
    setErrorMessage("");

    const trimmedReason = suspensionReason.trim();

    if (trimmedReason.length < 3) {
      setErrorMessage("Suspension reason must contain at least 3 characters.");
      return;
    }

    suspendMutation.mutate({
      id,
      dto: {
        reason: trimmedReason,
      },
    });
  }
  function handleReinstate() {
    setSuccessMessage("");
    setErrorMessage("");

    const trimmedReason = reinstateReason.trim();

    if (trimmedReason.length < 3) {
      setErrorMessage("Reinstatement reason must contain at least 3 characters.");
      return;
    }

    reinstateMutation.mutate({
      id,
      dto: {
        reason: trimmedReason,
      },
    });
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
    <AppShell title="Member Details" subtitle="View and manage the member account.">
      <Button variant="outline" className="mb-4" onClick={() => navigate({ to: "/members" })}>
        Back to members
      </Button>

      {isLoading && <p className="text-sm text-muted-foreground">Loading member...</p>}

      {isError && <p className="text-sm text-loss">Failed to load member.</p>}

      {member && (
        <Card>
          <CardHeader>
            <CardTitle>{member.fullName}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{member.email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Member ID</p>
              <p className="mt-1 break-all font-mono text-sm">{member._id}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Account status</p>

              <Badge
                variant="outline"
                className={
                  member.status === "ACTIVE"
                    ? "mt-1 border-profit/20 bg-profit/10 text-profit"
                    : member.status === "SUSPENDED"
                      ? "mt-1 border-loss/20 bg-loss/10 text-loss"
                      : "mt-1 border-gold/30 bg-gold/10 text-gold"
                }
              >
                {member.status}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Identity status</p>

              <Badge
                variant="outline"
                className={
                  member.identityVerificationStatus === "APPROVED"
                    ? "mt-1 border-profit/20 bg-profit/10 text-profit"
                    : member.identityVerificationStatus === "REJECTED"
                      ? "mt-1 border-loss/20 bg-loss/10 text-loss"
                      : "mt-1 border-gold/30 bg-gold/10 text-gold"
                }
              >
                {member.identityVerificationStatus}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Email verified</p>
              <p className="mt-1 text-sm font-medium">{member.isEmailVerified ? "Yes" : "No"}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">National ID</p>
              <p className="mt-1 font-mono text-sm">{member.nationalId}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Date of birth</p>
              <p className="mt-1 text-sm font-medium">
                {new Date(member.dateOfBirth).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Last login</p>
              <p className="mt-1 text-sm font-medium">
                {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : "Never"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="mt-1 text-sm font-medium">
                {new Date(member.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="mt-1 text-sm font-medium">
                {new Date(member.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4 border-t pt-6 sm:col-span-2">
              <div>
                <h3 className="font-medium">Identity review</h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Approve the identity or provide a reason to reject it.
                </p>
              </div>

              <Input
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Rejection reason, required when rejecting"
                maxLength={500}
              />

              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={identityMutation.isPending} onClick={handleApprove}>
                  {identityMutation.isPending ? "Updating..." : "Approve identity"}
                </Button>

                <Button
                  type="button"
                  className="bg-loss text-white hover:bg-loss/90"
                  disabled={identityMutation.isPending || !rejectionReason.trim()}
                  onClick={handleReject}
                >
                  {identityMutation.isPending ? "Updating..." : "Reject identity"}
                </Button>
              </div>
            </div>

            {cmsRole === "ADMINISTRATOR" && member.status !== "SUSPENDED" && (
              <div className="space-y-4 border-t pt-6 sm:col-span-2">
                <div>
                  <h3 className="font-medium">Suspend member</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter a reason before suspending this account.
                  </p>
                </div>

                <Input
                  value={suspensionReason}
                  onChange={(event) => setSuspensionReason(event.target.value)}
                  placeholder="Suspension reason"
                  minLength={3}
                  maxLength={500}
                />

                <Button
                  type="button"
                  className="bg-loss text-white hover:bg-loss/90"
                  disabled={suspendMutation.isPending}
                  onClick={handleSuspend}
                >
                  {suspendMutation.isPending ? "Suspending..." : "Suspend member"}
                </Button>
              </div>
            )}

            {cmsRole === "ADMINISTRATOR" && member.status === "SUSPENDED" && (
              <div className="space-y-4 border-t pt-6 sm:col-span-2">
                <div>
                  <h3 className="font-medium">Reinstate member</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter a reason before restoring this account.
                  </p>
                </div>

                <Input
                  value={reinstateReason}
                  onChange={(event) => setReinstateReason(event.target.value)}
                  placeholder="Reinstatement reason"
                  minLength={3}
                  maxLength={500}
                />

                <Button
                  type="button"
                  disabled={reinstateMutation.isPending}
                  onClick={handleReinstate}
                >
                  {reinstateMutation.isPending ? "Reinstating..." : "Reinstate member"}
                </Button>
              </div>
            )}

            {successMessage && (
              <p className="text-sm text-profit sm:col-span-2">{successMessage}</p>
            )}

            {errorMessage && <p className="text-sm text-loss sm:col-span-2">{errorMessage}</p>}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
