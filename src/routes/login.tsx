import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, type FormEvent } from "react";

import { api } from "@/services/api";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { LineChart, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

interface LoginResponse {
  accessToken: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    userType: string;
    status: string;
    identityVerificationStatus: string;
  };
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Sign in · Meridian Trading",
      },
      {
        name: "description",
        content: "Sign in to your Meridian trading account.",
      },
      {
        property: "og:title",
        content: "Sign in · Meridian",
      },
      {
        property: "og:description",
        content: "Access your portfolio, orders and watchlist.",
      },
    ],
  }),

  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      const { accessToken, user } = response.data;

      if (!accessToken) {
        throw new Error("The login response did not contain an access token.");
      }

      /*
       * Remove previous authentication information
       * before saving the new login session.
       */
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");

      /*
       * Wipe every cached React Query result (orders, stocks, wallet,
       * portfolio, etc.) belonging to whoever was previously logged
       * in on this browser. Without this, switching accounts can show
       * the old account's cached data for a moment (or longer) before
       * a fresh fetch happens, since queries are cached by queryKey
       * only — not per-user. Must run before the new session is used
       * anywhere.
       */
      queryClient.clear();

      /*
       * Remember me:
       * - true: token remains after closing the browser
       * - false: token remains only for this browser tab/session
       */
      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);

        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("accessToken", accessToken);

        sessionStorage.setItem("user", JSON.stringify(user));
      }

      await navigate({
        to: "/",
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else if (typeof backendMessage === "string") {
          setErrorMessage(backendMessage);
        } else if (error.code === "ERR_NETWORK") {
          setErrorMessage("Unable to connect to the backend server.");
        } else {
          setErrorMessage("Login failed. Check your email and password.");
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left branding panel */}

      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#1E3A8A_0%,transparent_40%),radial-gradient(circle_at_80%_60%,#F59E0B_0%,transparent_40%)]" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div>
            <div className="font-semibold tracking-tight">Meridian</div>

            <div className="text-xs text-white/60">Trading Platform</div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Trade smarter. <span className="text-gold">Invest with confidence.</span>
          </h2>

          <p className="mt-4 max-w-md text-white/70">
            A professional trading platform built for modern investors, with market information,
            analytics, and portfolio management.
          </p>

          <div className="mt-10 grid max-w-md gap-4">
            {[
              {
                icon: LineChart,
                title: "Market information",
                body: "View available stocks and their latest prices.",
              },
              {
                icon: ShieldCheck,
                title: "Secure authentication",
                body: "Access protected member and CMS features.",
              },
              {
                icon: Sparkles,
                title: "Portfolio analytics",
                body: "Review investment activity and performance.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/30 text-white">
                  <feature.icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-medium">{feature.title}</div>

                  <div className="text-xs text-white/60">{feature.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/50">
          <span>© 2026 Meridian Capital</span>

          <span>Stock Market Platform</span>
        </div>
      </div>

      {/* Login form */}

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>

            <span className="font-semibold tracking-tight">Meridian</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue trading.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="h-11"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                <Link to="/login" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                disabled={isLoading}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />

              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="h-11 w-full text-base" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="text-xs text-muted-foreground">New member?</span>

            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}