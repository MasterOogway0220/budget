"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { investmentSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/investments");
}

export async function createInvestment(input: unknown): Promise<ActionResult> {
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.investment.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true };
}

export async function updateInvestment(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = investmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.investment.updateMany({ where: { id, userId }, data: parsed.data });
  revalidate();
  return { ok: true };
}

export async function deleteInvestment(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.investment.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}
