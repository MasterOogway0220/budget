"use client";

import { useState, useTransition } from "react";
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
import { INVESTMENT_TYPES } from "@/lib/constants";
import { createInvestment, updateInvestment } from "@/lib/actions/investments";

type InvestmentValues = {
  name: string;
  type: string;
  invested: string;
  currentValue: string;
  monthlySip: string;
};

export interface InvestmentFormData {
  id: string;
  name: string;
  type: string;
  invested: number;
  currentValue: number;
  monthlySip: number;
}

export function InvestmentForm({ investment }: { investment?: InvestmentFormData }) {
  const isEdit = Boolean(investment);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvestmentValues>({
    defaultValues: {
      name: investment?.name ?? "",
      type: investment?.type ?? "SIP",
      invested: investment ? String(investment.invested) : "",
      currentValue: investment ? String(investment.currentValue) : "",
      monthlySip: investment ? String(investment.monthlySip) : "0",
    },
  });

  function onSubmit(values: InvestmentValues) {
    startTransition(async () => {
      const res = isEdit
        ? await updateInvestment(investment!.id, values)
        : await createInvestment(values);
      if (res.ok) {
        toast.success(isEdit ? "Investment updated" : "Investment added");
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
              <Plus className="size-4" /> Add Investment
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit investment" : "Add investment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Nifty 50 Index Fund"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
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
                {INVESTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="invested">Invested (₹)</Label>
              <Input
                id="invested"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("invested", { required: "Invested amount is required" })}
              />
              {errors.invested && (
                <p className="text-sm text-destructive">{errors.invested.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("currentValue", {
                  required: "Current value is required",
                })}
              />
              {errors.currentValue && (
                <p className="text-sm text-destructive">
                  {errors.currentValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="monthlySip">Monthly SIP (₹)</Label>
            <Input
              id="monthlySip"
              type="number"
              step="1"
              inputMode="numeric"
              placeholder="0"
              {...register("monthlySip")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
