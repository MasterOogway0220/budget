"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
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
import { adjustAccountBalance } from "@/lib/actions/accounts";

type AmountValues = { amount: string };

function AdjustDialog({
  accountId,
  mode,
}: {
  accountId: string;
  mode: "deposit" | "withdraw";
}) {
  const isDeposit = mode === "deposit";
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AmountValues>({ defaultValues: { amount: "" } });

  function onSubmit(values: AmountValues) {
    startTransition(async () => {
      const amount = Number(values.amount);
      const delta = isDeposit ? amount : -amount;
      const res = await adjustAccountBalance(accountId, delta);
      if (res.ok) {
        toast.success(isDeposit ? "Deposited" : "Withdrawn");
        setOpen(false);
        reset();
      } else {
        toast.error(res.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="flex-1">
            {isDeposit ? (
              <ArrowDownToLine className="size-4" />
            ) : (
              <ArrowUpFromLine className="size-4" />
            )}
            {isDeposit ? "Deposit" : "Withdraw"}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isDeposit ? "Deposit" : "Withdraw"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${mode}-amount`}>Amount (₹)</Label>
            <Input
              id={`${mode}-amount`}
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
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isDeposit ? "Deposit" : "Withdraw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdjustBalance({ accountId }: { accountId: string }) {
  return (
    <div className="flex w-full items-center gap-2">
      <AdjustDialog accountId={accountId} mode="deposit" />
      <AdjustDialog accountId={accountId} mode="withdraw" />
    </div>
  );
}
