import axios from "axios";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginCms } from "@/services/auth";
import { useQueryClient } from "@tanstack/react-query";
``;
export const Route = createFileRoute("/cms-login")({
  head: () => ({
    meta: [
      { title: "CMS Login · Meridian Trading" },
      {
        name: "description",
        content: "Secure login for Meridian CMS users.",
      },
    ],
  }),
  component: CmsLoginPage,
});

function CmsLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const cmsLoginMutation = useMutation({
    mutationFn: loginCms,

    onSuccess: async (data) => {
      setErrorMessage("");
      setInfoMessage("");

      if (data.requiresPasswordChange) {
        sessionStorage.setItem("cmsEmail", email.trim());
        sessionStorage.setItem("cmsTemporaryPassword", password);

        await navigate({
          to: "/cms-change-password",
        });

        return;
      }

      if (!data.accessToken) {
        setErrorMessage("CMS login did not return an access token.");
        return;
      }

      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");

      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("userType", "CMS");

      if (data.user) {
        sessionStorage.setItem("cmsUser", JSON.stringify(data.user));
      }

      queryClient.removeQueries({
        queryKey: ["cms-users"],
      });

      queryClient.removeQueries({
        queryKey: ["cms-user"],
      });

      await navigate({
        to: "/admin",
      });
    },

    onError: (error: unknown) => {
      setInfoMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else {
          setErrorMessage(backendMessage || "CMS login failed.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("CMS login failed:", error);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setInfoMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    cmsLoginMutation.mutate({
      email: trimmedEmail,
      password,
    });
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="font-semibold tracking-tight">Meridian CMS</p>
              <p className="text-xs text-muted-foreground">Administrative access</p>
            </div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">CMS sign in</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your CMS account credentials to continue.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="cmsEmail">Email address</Label>

              <Input
                id="cmsEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@meridian.com"
                className="h-11"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cmsPassword">Password</Label>

              <Input
                id="cmsPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-11"
                autoComplete="current-password"
                required
              />
            </div>

            {infoMessage && <p className="text-sm text-gold">{infoMessage}</p>}

            {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

            <Button type="submit" className="h-11 w-full" disabled={cmsLoginMutation.isPending}>
              {cmsLoginMutation.isPending ? "Signing in..." : "Sign in to CMS"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Member account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Member sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_70%_20%,#F59E0B_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#1E3A8A_0%,transparent_40%)]" />

        <div className="relative max-w-lg">
          <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/15 bg-white/10">
            <LockKeyhole className="h-7 w-7 text-gold" />
          </div>

          <h2 className="mt-8 text-4xl font-semibold leading-tight tracking-tight">
            Secure platform <span className="text-gold">administration.</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-white/70">
            Manage members, CMS users, identity verification, account status, and platform
            operations from one protected workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
