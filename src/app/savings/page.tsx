import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { toNumber, formatINR } from "@/lib/format";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteButton } from "@/components/delete-button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, ShieldCheck, Layers } from "lucide-react";
import { AccountForm, type AccountFormData } from "./account-form";
import { AdjustBalance } from "./adjust-balance";
import { deleteAccount } from "@/lib/actions/accounts";

export const dynamic = "force-dynamic";

const ACCOUNT_TYPE_MAP = Object.fromEntries(
  ACCOUNT_TYPES.map((t) => [t.value, t])
) as Record<string, (typeof ACCOUNT_TYPES)[number]>;

export default async function SavingsPage() {
  const user = await getCurrentUser();

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const totalSavings = accounts.reduce((sum, a) => sum + toNumber(a.balance), 0);
  const emergencyFund = accounts
    .filter((a) => a.type === "EMERGENCY")
    .reduce((sum, a) => sum + toNumber(a.balance), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Savings"
        description="Every account and stash, balanced in one place."
      >
        <AccountForm />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Savings"
          value={formatINR(totalSavings)}
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label="Emergency Fund"
          value={formatINR(emergencyFund)}
          icon={ShieldCheck}
        />
        <StatCard
          label="Accounts"
          value={String(accounts.length)}
          icon={Layers}
        />
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No accounts yet. Add your first one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const meta = ACCOUNT_TYPE_MAP[a.type];
            const formData: AccountFormData = {
              id: a.id,
              name: a.name,
              type: a.type,
              balance: toNumber(a.balance),
            };
            return (
              <Card key={a.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{meta?.emoji}</span>
                    {a.name}
                  </CardTitle>
                  <CardAction>
                    <div className="flex items-center gap-1">
                      <AccountForm account={formData} />
                      <DeleteButton
                        label="account"
                        onDelete={deleteAccount.bind(null, a.id)}
                      />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <span className="text-xs text-muted-foreground">
                    {meta?.label ?? a.type}
                  </span>
                  <span className="text-2xl font-semibold tracking-tight">
                    {formatINR(toNumber(a.balance))}
                  </span>
                </CardContent>
                <CardFooter>
                  <AdjustBalance accountId={a.id} />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
