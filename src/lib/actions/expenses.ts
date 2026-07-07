"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { expenseSchema } from "@/lib/validations";

export type ActionResult = { ok: boolean; error?: string };

const REVALIDATE = ["/", "/expenses", "/budgets"];
function revalidate() {
  for (const p of REVALIDATE) revalidatePath(p);
}

function parseTags(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createExpense(input: unknown): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  const { tags, ...data } = parsed.data;
  await prisma.expense.create({
    data: { ...data, tags: parseTags(tags), userId },
  });
  revalidate();
  return { ok: true };
}

export async function updateExpense(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  const { tags, ...data } = parsed.data;
  await prisma.expense.updateMany({
    where: { id, userId },
    data: { ...data, tags: parseTags(tags) },
  });
  revalidate();
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.expense.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}
