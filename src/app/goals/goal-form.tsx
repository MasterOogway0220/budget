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
import { createGoal, updateGoal } from "@/lib/actions/goals";

type GoalValues = {
  name: string;
  targetAmount: string;
  savedAmount: string;
  monthlyContribution: string;
  deadline: string;
};

export interface GoalFormData {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  deadline: string | null; // yyyy-MM-dd
}

export function GoalForm({ goal }: { goal?: GoalFormData }) {
  const isEdit = Boolean(goal);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalValues>({
    defaultValues: {
      name: goal?.name ?? "",
      targetAmount: goal ? String(goal.targetAmount) : "",
      savedAmount: goal ? String(goal.savedAmount) : "0",
      monthlyContribution: goal ? String(goal.monthlyContribution) : "0",
      deadline: goal?.deadline ?? "",
    },
  });

  function onSubmit(values: GoalValues) {
    startTransition(async () => {
      const res = isEdit
        ? await updateGoal(goal!.id, values)
        : await createGoal(values);
      if (res.ok) {
        toast.success(isEdit ? "Goal updated" : "Goal added");
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
              <Plus className="size-4" /> Add Goal
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "Add goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. New bike"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="targetAmount">Target amount (₹)</Label>
            <Input
              id="targetAmount"
              type="number"
              step="1"
              inputMode="numeric"
              placeholder="0"
              {...register("targetAmount", { required: "Target is required" })}
            />
            {errors.targetAmount && (
              <p className="text-sm text-destructive">
                {errors.targetAmount.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="savedAmount">Saved (₹)</Label>
              <Input
                id="savedAmount"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("savedAmount")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monthlyContribution">Monthly (₹)</Label>
              <Input
                id="monthlyContribution"
                type="number"
                step="1"
                inputMode="numeric"
                placeholder="0"
                {...register("monthlyContribution")}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" type="date" {...register("deadline")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
