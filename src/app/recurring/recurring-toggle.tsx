"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleRecurring } from "@/lib/actions/recurring";

export function RecurringToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const res = await toggleRecurring(id, checked);
      if (res.ok) {
        toast.success(checked ? "Resumed" : "Paused");
      } else {
        toast.error(res.error ?? "Failed to update");
      }
    });
  }

  return (
    <Switch
      checked={active}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={active ? "Pause" : "Resume"}
    />
  );
}
