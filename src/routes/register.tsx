import axios from "axios";
import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { registerMember } from "@/services/auth";
import { TrendingUp, Check } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account · Meridian Trading" },
      {
        name: "description",
        content: "Open a Meridian trading account in minutes.",
      },
      { property: "og:title", content: "Create account · Meridian" },
      {
        property: "og:description",
        content: "Start investing with a professional-grade platform.",
      },
    ],
  }),
  component: RegisterPage,
});

const steps = ["Account", "Identity", "Verify"];

function RegisterPage() {
  const navigate = useNavigate();

  // Keep your states below
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const registerMutation = useMutation({
    mutationFn: registerMember,
    onSuccess: async (_data, variables) => {
      sessionStorage.setItem("registrationEmail", variables.email);

      setSuccessMessage("Registration successful.");
      setErrorMessage("");

      await navigate({
        to: "/verify-otp",
      });
    },

    onError: (error: unknown) => {
      setSuccessMessage("");

      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setErrorMessage(backendMessage.join(", "));
        } else {
          setErrorMessage(backendMessage || "Registration failed.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }

      console.error("Registration failed:", error);
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedNationalId = nationalId.trim();

    if (!trimmedFullName) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (trimmedNationalId.length < 6) {
      setErrorMessage("National ID must contain at least 6 characters.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage("You must accept the Terms of Service.");
      return;
    }

    registerMutation.mutate({
      fullName: trimmedFullName,
      email: trimmedEmail,
      nationalId: trimmedNationalId,
      dateOfBirth,
    });
  }

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
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 items-center gap-2">
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium ${
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>

                <span
                  className={`text-xs ${
                    index === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>

                {index < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Just a few details, and you&apos;ll be trading in minutes.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>

              <Input
                id="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Sarah Johnson"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nid">National ID</Label>

                <Input
                  id="nid"
                  value={nationalId}
                  onChange={(event) => setNationalId(event.target.value)}
                  minLength={6}
                  maxLength={30}
                  placeholder="1234567890"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>

                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="tos"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-1"
              />

              <Label
                htmlFor="tos"
                className="text-sm font-normal leading-relaxed text-muted-foreground"
              >
                I agree to Meridian&apos;s{" "}
                <span className="text-primary underline">Terms of Service</span> and{" "}
                <span className="text-primary underline">Privacy Policy</span>.
              </Label>
            </div>

            {successMessage && <p className="text-sm text-profit">{successMessage}</p>}

            {errorMessage && <p className="text-sm text-loss">{errorMessage}</p>}

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden flex-col justify-center overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_70%_20%,#F59E0B_0%,transparent_40%),radial-gradient(circle_at_20%_80%,#1E3A8A_0%,transparent_40%)]" />

        <div className="relative">
          <span className="inline-flex rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Trusted by 240,000+ investors
          </span>

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
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-profit/20 text-profit">
                  <Check className="h-3.5 w-3.5" />
                </div>

                <span className="text-sm text-white/80">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm italic text-white/80">
              &quot;The cleanest, fastest trading experience I&apos;ve used. The analytics alone are
              worth the switch.&quot;
            </div>

            <div className="mt-3 text-xs text-white/60">Michael C., Portfolio Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
