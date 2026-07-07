"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { incomeSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/income");
}

export async function createIncome(input: unknown): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.income.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true };
}

export async function updateIncome(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = incomeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.income.updateMany({ where: { id, userId }, data: parsed.data });
  revalidate();
  return { ok: true };
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.income.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}
