"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { INCOME_TYPES } from "@/lib/constants";
import { createIncome, updateIncome } from "@/lib/actions/income";

type IncomeValues = {
  source: string;
  amount: string;
  type: string;
  date: string;
  recurring: boolean;
  note: string;
};

export interface IncomeFormData {
  id: string;
  source: string;
  amount: number;
  type: string;
  date: string; // yyyy-MM-dd
  recurring: boolean;
  note: string | null;
}

export function IncomeForm({ income }: { income?: IncomeFormData }) {
  const isEdit = Boolean(income);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeValues>({
    defaultValues: {
      source: income?.source ?? "",
      amount: income ? String(income.amount) : "",
      type: income?.type ?? "SALARY",
      date: income?.date ?? format(new Date(), "yyyy-MM-dd"),
      recurring: income?.recurring ?? false,
      note: income?.note ?? "",
    },
  });

  function onSubmit(values: IncomeValues) {
    startTransition(async () => {
      const res = isEdit
        ? await updateIncome(income!.id, values)
        : await createIncome(values);
      if (res.ok) {
        toast.success(isEdit ? "Income updated" : "Income added");
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
          isEdit ? (
            <Button variant="ghost" size="icon" className="size-8">
              <Pencil className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
          ) : (
            <Button>
              <Plus className="size-4" /> Add Income
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit income" : "Add income"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g. Monthly salary"
              {...register("source", { required: "Source is required" })}
            />
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source.message}</p>
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
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v ?? "")}
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={watch("recurring")}
              onCheckedChange={(checked) => setValue("recurring", checked === true)}
            />
            <Label htmlFor="recurring">Recurring income</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="Anything to remember?"
              {...register("note")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
