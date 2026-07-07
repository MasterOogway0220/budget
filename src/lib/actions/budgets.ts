"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { budgetSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/budgets");
}

/** Create or update the budget for a category (one row per category). */
export async function setBudget(input: unknown): Promise<ActionResult> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  const { category, amount } = parsed.data;
  await prisma.budget.upsert({
    where: { userId_category: { userId, category } },
    update: { amount },
    create: { userId, category, amount },
  });
  revalidate();
  return { ok: true };
}

export async function deleteBudget(category: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.budget.deleteMany({
    where: { userId, category: category as never },
  });
  revalidate();
  return { ok: true };
}
