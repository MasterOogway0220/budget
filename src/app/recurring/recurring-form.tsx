"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  INCOME_TYPES,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { createRecurring, updateRecurring } from "@/lib/actions/recurring";

type RecurringValues = {
  kind: string;
  label: string;
  amount: string;
  dayOfMonth: string;
  category: string;
  paymentMethod: string;
  incomeType: string;
};

export interface RecurringFormData {
  id: string;
  kind: string;
  label: string;
  amount: number;
  dayOfMonth: number;
  category: string | null;
  paymentMethod: string;
  incomeType: string | null;
  active: boolean;
}

export function RecurringForm({
  recurring,
  trigger,
}: {
  recurring?: RecurringFormData;
  trigger?: ReactElement;
}) {
  const isEdit = Boolean(recurring);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurringValues>({
    defaultValues: {
      kind: recurring?.kind ?? "EXPENSE",
      label: recurring?.label ?? "",
      amount: recurring ? String(recurring.amount) : "",
      dayOfMonth: recurring ? String(recurring.dayOfMonth) : "1",
      category: recurring?.category ?? "FOOD",
      paymentMethod: recurring?.paymentMethod ?? "UPI",
      incomeType: recurring?.incomeType ?? "SALARY",
    },
  });

  const kind = watch("kind");

  function onSubmit(values: RecurringValues) {
    const payload = {
      kind: values.kind,
      label: values.label,
      amount: values.amount,
      dayOfMonth: values.dayOfMonth,
      category: values.kind === "EXPENSE" ? values.category : null,
      paymentMethod: values.kind === "EXPENSE" ? values.paymentMethod : "UPI",
      incomeType: values.kind === "INCOME" ? values.incomeType : null,
      active: recurring?.active ?? true,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateRecurring(recurring!.id, payload)
        : await createRecurring(payload);
      if (res.ok) {
        toast.success(isEdit ? "Recurring updated" : "Recurring added");
        setOpen(false);
        if (!isEdit) reset();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ? (
            trigger
          ) : isEdit ? (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add Recurring
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit recurring" : "Add recurring"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={watch("kind")}
              onValueChange={(v) => setValue("kind", v ?? "")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g. Salary, Netflix, SIP"
              {...register("label", { required: "Label is required" })}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("amount", { required: "Amount is required" })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dayOfMonth">Day of month</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min={1}
                max={28}
                step="1"
                inputMode="numeric"
                placeholder="1"
                {...register("dayOfMonth", { required: "Day is required" })}
              />
              {errors.dayOfMonth && (
                <p className="text-sm text-destructive">
                  {errors.dayOfMonth.message}
                </p>
              )}
            </div>
          </div>

          {kind === "EXPENSE" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Payment</Label>
                <Select
                  value={watch("paymentMethod")}
                  onValueChange={(v) => setValue("paymentMethod", v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Income type</Label>
              <Select
                value={watch("incomeType")}
                onValueChange={(v) => setValue("incomeType", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Add recurring"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
