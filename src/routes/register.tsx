import { createFileRoute, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, Check } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · Meridian Trading" },
      { name: "description", content: "Open a Meridian trading account in minutes." },
      { property: "og:title", content: "Create account · Meridian" },
      { property: "og:description", content: "Start investing with a professional-grade platform." },
    ],
  }),
  component: RegisterPage,
});

const steps = ["Account", "Identity", "Verify"];

function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">Meridian</span>
          </div>

          <div className="mb-8 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium ${i===0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i+1}
                </div>
                <span className={`text-xs ${i===0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Just a few details — you'll be trading in minutes.</p>

          <form className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Sarah Johnson" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@company.com" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nid">National ID</Label>
                <Input id="nid" placeholder="1234567890" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input id="dob" type="date" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" placeholder="At least 10 characters" className="h-11" />
              <div className="mt-1 flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded ${i<=3 ? "bg-profit" : "bg-muted"}`} />)}
              </div>
            </div>
            <div className="flex items-start gap-2 pt-1">
              <Checkbox id="tos" className="mt-1" />
              <Label htmlFor="tos" className="text-sm font-normal text-muted-foreground leading-relaxed">
                I agree to Meridian's <span className="text-primary underline">Terms of Service</span> and <span className="text-primary underline">Privacy Policy</span>.
              </Label>
            </div>
            <Button type="button" className="h-11 w-full text-base">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:flex flex-col justify-center bg-navy text-white p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_70%_20%,#F59E0B_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#1E3A8A_0%,transparent_40%)]" />
        <div className="relative">
          <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">Trusted by 240,000+ investors</span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
            Everything you need to <span className="text-gold">grow your wealth.</span>
          </h2>

          <div className="mt-10 space-y-4">
            {[
              "Commission-free stock trading",
              "Fractional shares from $1",
              "Real-time L2 market data",
              "Advanced charting & indicators",
              "Cash management with 4.75% APY",
              "24/7 customer support",
            ].map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-profit/20 text-profit">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-white/80">{b}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm italic text-white/80">
              "The cleanest, fastest trading experience I've used. The analytics alone are worth the switch."
            </div>
            <div className="mt-3 text-xs text-white/60">Michael C., Portfolio Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
