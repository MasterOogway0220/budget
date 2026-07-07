"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { accountSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/savings");
}

export async function createAccount(input: unknown): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.account.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true };
}

export async function updateAccount(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = accountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.account.updateMany({ where: { id, userId }, data: parsed.data });
  revalidate();
  return { ok: true };
}

/** Adjust balance by a delta (deposit positive, withdraw negative). */
export async function adjustAccountBalance(
  id: string,
  delta: number
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  const account = await prisma.account.findFirst({ where: { id, userId } });
  if (!account) return { ok: false, error: "Account not found" };
  const next = Number(account.balance.toString()) + delta;
  if (next < 0) return { ok: false, error: "Balance cannot go below 0" };
  await prisma.account.update({ where: { id }, data: { balance: next } });
  revalidate();
  return { ok: true };
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.account.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}
