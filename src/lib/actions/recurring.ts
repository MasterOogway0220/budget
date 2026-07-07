"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/user";
import { recurringSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/expenses";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/recurring");
  revalidatePath("/income");
  revalidatePath("/expenses");
}

export async function createRecurring(input: unknown): Promise<ActionResult> {
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.recurringTransaction.create({ data: { ...parsed.data, userId } });
  revalidate();
  return { ok: true };
}

export async function updateRecurring(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = recurringSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const userId = await getCurrentUserId();
  await prisma.recurringTransaction.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  revalidate();
  return { ok: true };
}

export async function toggleRecurring(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.recurringTransaction.updateMany({
    where: { id, userId },
    data: { active },
  });
  revalidate();
  return { ok: true };
}

export async function deleteRecurring(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  await prisma.recurringTransaction.deleteMany({ where: { id, userId } });
  revalidate();
  return { ok: true };
}

/**
 * Materialize any recurring templates whose day-of-month has arrived and that
 * haven't already run this calendar month. Safe to call on every dashboard load
 * (idempotent via lastRunYear/lastRunMonth). Does NOT revalidate — intended to
 * run inside a server-component render, which reads fresh data in the same pass.
 * Returns the number of entries created.
 */
export async function applyDueRecurring(userId: string): Promise<number> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  const templates = await prisma.recurringTransaction.findMany({
    where: { userId, active: true },
  });

  let created = 0;
  for (const t of templates) {
    const alreadyRan = t.lastRunYear === year && t.lastRunMonth === month;
    if (alreadyRan || day < t.dayOfMonth) continue;

    const date = new Date(year, month - 1, t.dayOfMonth, 9);
    try {
      if (t.kind === "INCOME") {
        await prisma.income.create({
          data: {
            userId,
            source: t.label,
            amount: t.amount,
            type: t.incomeType ?? "OTHER",
            recurring: true,
            date,
          },
        });
      } else {
        await prisma.expense.create({
          data: {
            userId,
            amount: t.amount,
            category: t.category ?? "MISCELLANEOUS",
            description: t.label,
            paymentMethod: t.paymentMethod,
            date,
          },
        });
      }
      await prisma.recurringTransaction.update({
        where: { id: t.id },
        data: { lastRunYear: year, lastRunMonth: month },
      });
      created += 1;
    } catch {
      // Don't let one bad template break the render.
    }
  }
  return created;
}
