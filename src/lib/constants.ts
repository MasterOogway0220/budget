import type {
  ExpenseCategory,
  IncomeType,
  PaymentMethod,
  AccountType,
  InvestmentType,
} from "@/generated/prisma/client";

// Fixed identity for the single-user app (no auth yet).
export const DEFAULT_USER_EMAIL = "web@kaizeninfotech.com";
export const DEFAULT_USER_NAME = "Aditya";
export const DEFAULT_MONTHLY_SALARY = 22000;

// ---------------------------------------------------------------------------
// Categories & labels
// ---------------------------------------------------------------------------

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { value: "FOOD", label: "Food", emoji: "🍔", color: "#f97316" },
  { value: "TRAVEL", label: "Travel", emoji: "🚌", color: "#0ea5e9" },
  { value: "SMOKING", label: "Smoking", emoji: "🚬", color: "#ef4444" },
  { value: "SHOPPING", label: "Shopping", emoji: "🛍️", color: "#ec4899" },
  { value: "ENTERTAINMENT", label: "Entertainment", emoji: "🎬", color: "#a855f7" },
  { value: "MEDICAL", label: "Medical", emoji: "💊", color: "#14b8a6" },
  { value: "UTILITIES", label: "Utilities", emoji: "💡", color: "#eab308" },
  { value: "BILLS", label: "Bills", emoji: "🧾", color: "#64748b" },
  { value: "INVESTMENTS", label: "Investments", emoji: "📈", color: "#22c55e" },
  { value: "EDUCATION", label: "Education", emoji: "📚", color: "#6366f1" },
  { value: "GIFTS", label: "Gifts", emoji: "🎁", color: "#f43f5e" },
  { value: "MISCELLANEOUS", label: "Misc", emoji: "📦", color: "#94a3b8" },
];

export const CATEGORY_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c])
) as Record<ExpenseCategory, (typeof EXPENSE_CATEGORIES)[number]>;

export const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: "SALARY", label: "Salary" },
  { value: "BONUS", label: "Bonus" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTEREST", label: "Interest" },
  { value: "OTHER", label: "Other" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "UPI", label: "UPI" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "NETBANKING", label: "Net Banking" },
  { value: "OTHER", label: "Other" },
];

export const ACCOUNT_TYPES: { value: AccountType; label: string; emoji: string }[] = [
  { value: "SAVINGS", label: "Savings Account", emoji: "🏦" },
  { value: "WALLET", label: "Wallet Cash", emoji: "👛" },
  { value: "UPI", label: "UPI Balance", emoji: "📱" },
  { value: "EMERGENCY", label: "Emergency Fund", emoji: "🛟" },
];

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "SIP", label: "SIP" },
  { value: "MUTUAL_FUND", label: "Mutual Fund" },
  { value: "STOCK", label: "Stocks" },
  { value: "GOLD", label: "Gold" },
  { value: "FD", label: "Fixed Deposit" },
];

// ---------------------------------------------------------------------------
// Default monthly allocations (from the PRD)
// ---------------------------------------------------------------------------

export const DEFAULT_BUDGETS: { category: ExpenseCategory; amount: number }[] = [
  { category: "TRAVEL", amount: 1100 },
  { category: "SMOKING", amount: 1500 },
  { category: "FOOD", amount: 800 },
  { category: "ENTERTAINMENT", amount: 500 },
];

export const SIP_MONTHLY_TARGET = 6000;
export const BIKE_GOAL_MONTHLY = 11000;
export const EMERGENCY_MONTHLY = 1100;
export const SMOKING_DAILY_TARGET = 40; // ₹/day, stepping down to 0
