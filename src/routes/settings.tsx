import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Manage your account and application preferences."
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Settings will be available here.
        </p>
      </div>
    </AppShell>
  );
}
``