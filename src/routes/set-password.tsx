import axios from "axios";
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setMemberPassword } from "@/services/auth";

export const Route = createFileRoute("/set-password")({
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const registrationEmail = sessionStorage.getItem("registrationEmail");

    if (registrationEmail) {
      setEmail(registrationEmail);
    }
  }, []);

  const setPasswordMutation = useMutation({
    mutationFn: setMemberPassword,

    onSuccess: async () => {
      setSuccessMessage("Password set successfully. Your account is now active.");
      setErrorMessage("");

      sessionStorage.removeItem("registrationEmail");

      await navigate({
        to: "/login",
      });
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else {
          setErrorMessage(backendMessage || "Failed to set password.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Set password failed:", error);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setPasswordMutation.mutate({
      email: trimmedEmail,
      password,
      confirmPassword,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Set your password</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a password to activate your account.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="h-11"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>

            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter the password again"
              className="h-11"
              minLength={8}
              required
            />
          </div>

          {successMessage && <p className="text-sm text-profit">{successMessage}</p>}

          {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

          <Button type="submit" className="h-11 w-full" disabled={setPasswordMutation.isPending}>
            {setPasswordMutation.isPending ? "Setting password..." : "Set password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already activated your account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
