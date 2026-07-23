import { createFileRoute, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, ShieldCheck, LineChart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Meridian Trading" },
      { name: "description", content: "Sign in to your Meridian trading account." },
      { property: "og:title", content: "Sign in · Meridian" },
      { property: "og:description", content: "Access your portfolio, orders and watchlist." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy text-white p-12 overflow-hidden">
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
            A professional-grade trading platform built for modern investors — real-time markets, deep analytics, and institutional insight.
          </p>

          <div className="mt-10 grid gap-4 max-w-md">
            {[
              { icon: LineChart, title: "Real-time market data", body: "Sub-second quotes across 20+ exchanges." },
              { icon: ShieldCheck, title: "Bank-grade security", body: "256-bit encryption and 2FA on every trade." },
              { icon: Sparkles, title: "AI-powered insights", body: "Personalized signals and portfolio guidance." },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/30 text-white">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{f.title}</div>
                  <div className="text-xs text-white/60">{f.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/50">
          <span>© 2026 Meridian Capital</span>
          <span>SIPC · FINRA member</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">Meridian</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue trading.</p>

          <form className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@company.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/login" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" className="h-11" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Remember me for 30 days</Label>
            </div>
            <Button type="button" className="h-11 w-full text-base">Sign in</Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11">Google</Button>
            <Button variant="outline" className="h-11">Apple</Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
