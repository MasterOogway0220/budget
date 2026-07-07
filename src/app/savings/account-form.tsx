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
import { ACCOUNT_TYPES } from "@/lib/constants";
import { createAccount, updateAccount } from "@/lib/actions/accounts";

type AccountValues = {
  name: string;
  type: string;
  balance: string;
};

export interface AccountFormData {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export function AccountForm({ account }: { account?: AccountFormData }) {
  const isEdit = Boolean(account);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountValues>({
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? "SAVINGS",
      balance: account ? String(account.balance) : "",
    },
  });

  function onSubmit(values: AccountValues) {
    startTransition(async () => {
      const res = isEdit
        ? await updateAccount(account!.id, values)
        : await createAccount(values);
      if (res.ok) {
        toast.success(isEdit ? "Account updated" : "Account added");
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
              <Plus className="size-4" /> Add Account
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. HDFC Savings"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="balance">Balance (₹)</Label>
              <Input
                id="balance"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("balance", { required: "Balance is required" })}
              />
              {errors.balance && (
                <p className="text-sm text-destructive">
                  {errors.balance.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
