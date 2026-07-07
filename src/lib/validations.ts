import { z } from "zod";

const amount = z.coerce
  .number({ message: "Enter a valid amount" })
  .positive("Amount must be greater than 0");

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : new Date()));

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount,
  type: z.enum(["SALARY", "BONUS", "FREELANCE", "INTEREST", "OTHER"]),
  recurring: z.coerce.boolean().default(false),
  date: optionalDate,
  note: z.string().optional(),
});

export const expenseSchema = z.object({
  amount,
  category: z.enum([
    "FOOD",
    "TRAVEL",
    "SMOKING",
    "SHOPPING",
    "ENTERTAINMENT",
    "MEDICAL",
    "UTILITIES",
    "BILLS",
    "INVESTMENTS",
    "EDUCATION",
    "GIFTS",
    "MISCELLANEOUS",
  ]),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]),
  date: optionalDate,
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // comma-separated in the form
});

export const budgetSchema = z.object({
  category: z.enum([
    "FOOD",
    "TRAVEL",
    "SMOKING",
    "SHOPPING",
    "ENTERTAINMENT",
    "MEDICAL",
    "UTILITIES",
    "BILLS",
    "INVESTMENTS",
    "EDUCATION",
    "GIFTS",
    "MISCELLANEOUS",
  ]),
  amount,
});

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["SAVINGS", "WALLET", "UPI", "EMERGENCY"]),
  balance: z.coerce.number().min(0, "Balance cannot be negative"),
});

export const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().default("target"),
  targetAmount: amount,
  savedAmount: z.coerce.number().min(0).default(0),
  monthlyContribution: z.coerce.number().min(0).default(0),
  deadline: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : null)),
});

export const investmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["SIP", "MUTUAL_FUND", "STOCK", "GOLD", "FD"]),
  invested: amount,
  currentValue: z.coerce.number().min(0),
  monthlySip: z.coerce.number().min(0).default(0),
});

export const recurringSchema = z.object({
  kind: z.enum(["INCOME", "EXPENSE"]),
  label: z.string().min(1, "Label is required"),
  amount,
  dayOfMonth: z.coerce
    .number()
    .int()
    .min(1, "Day must be 1-28")
    .max(28, "Use 1-28 to work in every month"),
  category: z
    .enum([
      "FOOD",
      "TRAVEL",
      "SMOKING",
      "SHOPPING",
      "ENTERTAINMENT",
      "MEDICAL",
      "UTILITIES",
      "BILLS",
      "INVESTMENTS",
      "EDUCATION",
      "GIFTS",
      "MISCELLANEOUS",
    ])
    .nullish(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "NETBANKING", "OTHER"]).default("UPI"),
  incomeType: z.enum(["SALARY", "BONUS", "FREELANCE", "INTEREST", "OTHER"]).nullish(),
  active: z.coerce.boolean().default(true),
});

export type RecurringInput = z.infer<typeof recurringSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type InvestmentInput = z.infer<typeof investmentSchema>;
