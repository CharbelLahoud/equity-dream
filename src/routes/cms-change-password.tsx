import axios from "axios";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeCmsTemporaryPassword } from "@/services/auth";

export const Route = createFileRoute("/cms-change-password")({
  component: CmsChangePasswordPage,
});

function CmsChangePasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("cmsEmail");
    const storedTemporaryPassword = sessionStorage.getItem(
      "cmsTemporaryPassword",
    );

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedTemporaryPassword) {
      setTemporaryPassword(storedTemporaryPassword);
    }
  }, []);

  const changePasswordMutation = useMutation({
    mutationFn: changeCmsTemporaryPassword,

    onSuccess: async (data) => {
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("userType", "CMS");
      sessionStorage.setItem("cmsUser", JSON.stringify(data.user));

      sessionStorage.removeItem("cmsEmail");
      sessionStorage.removeItem("cmsTemporaryPassword");

      await navigate({
        to: "/admin",
      });
    },

    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else {
          setErrorMessage(
            backendMessage || "Failed to change password.",
          );
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Temporary password change failed:", error);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    changePasswordMutation.mutate({
      email: email.trim(),
      temporaryPassword,
      newPassword,
      confirmPassword,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Change temporary password
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a new password before accessing the CMS dashboard.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>

            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temporaryPassword">
              Temporary password
            </Label>

            <Input
              id="temporaryPassword"
              type="password"
              value={temporaryPassword}
              onChange={(event) =>
                setTemporaryPassword(event.target.value)
              }
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>

            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="At least 8 characters"
              minLength={8}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm new password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Enter the new password again"
              minLength={8}
              className="h-11"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-loss">{errorMessage}</p>
          )}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? "Changing password..."
              : "Change password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
