import axios from "axios";
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMyProfile, updateMyProfile } from "@/services/members.service";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

    setToken(storedToken);

    if (!storedToken) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  const {
    data: member,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      setSuccessMessage("Profile updated successfully.");
      setErrorMessage("");

      await queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
    },
    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else {
          setErrorMessage(backendMessage || "Failed to update profile.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Profile update failed:", error);
    },
  });

  useEffect(() => {
    if (member) {
      setFullName(member.fullName);
    }
  }, [member]);

  const isFullNameChanged = fullName.trim() !== member?.fullName;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedFullName = fullName.trim();

    if (!trimmedFullName) {
      setErrorMessage("Full name is required.");
      return;
    }

    updateProfileMutation.mutate({
      fullName: trimmedFullName,
    });
  }

  return (
    <AppShell title="Member Profile" subtitle="View and update your personal account information.">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}

          {isError && (
            <p className="text-sm text-loss">Failed to load your profile. Please sign in again.</p>
          )}

          {member && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full name
                </label>

                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>

                <Input id="email" value={member.email} disabled />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Account status
                </label>

                <Input id="status" value={member.status} disabled />
              </div>

              {successMessage && <p className="text-sm text-profit">{successMessage}</p>}

              {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || !isFullNameChanged}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
