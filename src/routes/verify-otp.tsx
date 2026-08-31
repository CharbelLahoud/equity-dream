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
import { verifyEmailOtp } from "@/services/auth";

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const registrationEmail =
      sessionStorage.getItem("registrationEmail");

    if (registrationEmail) {
      setEmail(registrationEmail);
    }
  }, []);

  const verifyOtpMutation = useMutation({
    mutationFn: verifyEmailOtp,

    onSuccess: async () => {
      setSuccessMessage("Email verified successfully.");
      setErrorMessage("");

      await navigate({
        to: "/set-password",
      });
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(", ")
            : backendMessage || "OTP verification failed.",
        );
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("OTP verification failed:", error);
    },
  });

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (trimmedCode.length !== 6) {
      setErrorMessage(
        "Verification code must contain exactly 6 characters.",
      );
      return;
    }

    verifyOtpMutation.mutate({
      email: trimmedEmail,
      code: trimmedCode,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and the 6-character verification code.
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
            <Label htmlFor="code">Verification code</Label>

            <Input
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              minLength={6}
              maxLength={6}
              placeholder="123456"
              className="h-11"
              required
            />
          </div>

          {successMessage && (
            <p className="text-sm text-profit">
              {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="text-sm text-loss">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending
              ? "Verifying..."
              : "Verify email"}
          </Button>
        </form>
      </div>
    </div>
  );
}