import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USER_EMAIL = "web@kaizeninfotech.com";

async function main() {
  console.log("🌱 Seeding Personal Finance OS…");

  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: { name: "Aditya", monthlySalary: 22000 },
    create: { email: USER_EMAIL, name: "Aditya", monthlySalary: 22000 },
  });

  // Reset owned data so the seed is idempotent.
  await prisma.$transaction([
    prisma.expense.deleteMany({ where: { userId: user.id } }),
    prisma.income.deleteMany({ where: { userId: user.id } }),
    prisma.budget.deleteMany({ where: { userId: user.id } }),
    prisma.goal.deleteMany({ where: { userId: user.id } }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
    prisma.investment.deleteMany({ where: { userId: user.id } }),
  ]);

  // --- Budgets (monthly allocations from the PRD) ---
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: "TRAVEL", amount: 1100 },
      { userId: user.id, category: "SMOKING", amount: 1500 },
      { userId: user.id, category: "FOOD", amount: 800 },
      { userId: user.id, category: "ENTERTAINMENT", amount: 500 },
    ],
  });

  // --- This month's salary ---
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  await prisma.income.create({
    data: {
      userId: user.id,
      source: "Monthly Salary",
      amount: 22000,
      type: "SALARY",
      recurring: true,
      date: firstOfMonth,
    },
  });

  // --- Savings accounts ---
  await prisma.account.createMany({
    data: [
      { userId: user.id, name: "Savings Account", type: "SAVINGS", balance: 8400 },
      { userId: user.id, name: "Wallet Cash", type: "WALLET", balance: 650 },
      { userId: user.id, name: "UPI Balance", type: "UPI", balance: 1200 },
      { userId: user.id, name: "Emergency Fund", type: "EMERGENCY", balance: 3300 },
    ],
  });

  // --- Goals ---
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: "New Bike",
        icon: "bike",
        targetAmount: 130000,
        savedAmount: 33000,
        monthlyContribution: 11000,
        deadline: new Date(now.getFullYear() + 1, 3, 1),
      },
      {
        userId: user.id,
        name: "Emergency Fund",
        icon: "shield",
        targetAmount: 66000,
        savedAmount: 3300,
        monthlyContribution: 1100,
      },
    ],
  });

  // --- Investments (SIP) ---
  await prisma.investment.create({
    data: {
      userId: user.id,
      name: "Index Fund SIP",
      type: "SIP",
      invested: 18000,
      currentValue: 19450,
      monthlySip: 6000,
    },
  });

  // --- A few sample expenses across this month ---
  const day = (offset: number) =>
    new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - offset), 12);

  await prisma.expense.createMany({
    data: [
      { userId: user.id, amount: 120, category: "SMOKING", description: "Cigarettes", paymentMethod: "CASH", date: day(0) },
      { userId: user.id, amount: 60, category: "FOOD", description: "Lunch", paymentMethod: "UPI", date: day(0) },
      { userId: user.id, amount: 40, category: "TRAVEL", description: "Bus fare", paymentMethod: "UPI", date: day(1) },
      { userId: user.id, amount: 250, category: "ENTERTAINMENT", description: "Movie", paymentMethod: "CARD", date: day(2) },
      { userId: user.id, amount: 80, category: "SMOKING", description: "Cigarettes", paymentMethod: "CASH", date: day(2) },
      { userId: user.id, amount: 90, category: "FOOD", description: "Groceries", paymentMethod: "UPI", date: day(3) },
      { userId: user.id, amount: 45, category: "TRAVEL", description: "Auto", paymentMethod: "CASH", date: day(4) },
      { userId: user.id, amount: 500, category: "SHOPPING", description: "T-shirt", paymentMethod: "UPI", date: day(5) },
    ],
  });

  console.log(`✅ Seeded user ${user.email} with budgets, income, accounts, goals, investments & expenses.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
