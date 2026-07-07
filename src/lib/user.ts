import "server-only";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_USER_EMAIL,
  DEFAULT_USER_NAME,
  DEFAULT_MONTHLY_SALARY,
} from "@/lib/constants";

/**
 * Single-user app (no auth yet). Resolves the one user, creating it on first
 * run so the app works before the seed is run.
 */
export async function getCurrentUser() {
  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
      monthlySalary: DEFAULT_MONTHLY_SALARY,
    },
  });
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}
