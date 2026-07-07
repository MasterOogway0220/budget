import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Diagnostic endpoint: reports whether the DB is reachable and surfaces the
// real connection error (production hides Server Component render errors).
export async function GET() {
  const url = process.env.DATABASE_URL;
  let dbHost: string | null = null;
  try {
    if (url) dbHost = new URL(url).host; // host:port only — no password
  } catch {
    dbHost = "unparseable";
  }

  if (!url) {
    return Response.json(
      { ok: false, hasDatabaseUrl: false, error: "DATABASE_URL is not set" },
      { status: 500 }
    );
  }

  try {
    const users = await prisma.user.count();
    return Response.json({ ok: true, dbHost, users });
  } catch (e) {
    return Response.json(
      {
        ok: false,
        hasDatabaseUrl: true,
        dbHost,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
