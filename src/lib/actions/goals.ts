"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { goalSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function createGoal(input: unknown): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.goal.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true };
}

export async function updateGoal(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  const data = parsed.data;
  const completed =
    Number(data.savedAmount) >= Number(data.targetAmount) && Number(data.targetAmount) > 0;
  await prisma.goal.updateMany({
    where: { id, userId },
    data: { ...data, completed },
  });
  revalidate();
  return { ok: true };
}

/** Add a contribution to a goal's saved amount. */
export async function contributeToGoal(
  id: string,
  amount: number
): Promise<ActionResult> {
  if (amount <= 0) return { ok: false, error: "Enter a positive amount" };
  const userId = await getCurrentUserId();
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) return { ok: false, error: "Goal not found" };
  const saved = Number(goal.savedAmount.toString()) + amount;
  const completed = saved >= Number(goal.targetAmount.toString());
  await prisma.goal.update({
    where: { id },
    data: { savedAmount: saved, completed },
  });
  revalidate();
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.goal.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}
