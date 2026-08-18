import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/Card";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated =
    await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Tournament Manager
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Manage players, teams and tournament data.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <AdminCard
            title="Players"
            description="Add, edit and manage tournament players."
            href="/players"
          />

          <AdminCard
            title="Teams"
            description="Manage football teams and tournament assignments."
            href="/teams"
          />

          <AdminCard
            title="Tournaments"
            description="Manage tournaments, standings and playoffs."
            href="/tournaments"
          />
        </div>

        <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
            Public site
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-950">
            See what visitors see
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The statistics page is public and does not
            require an admin login.
          </p>

          <Link
            href="/statistics"
            className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Open public statistics
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-6 transition group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:shadow-lg group-hover:shadow-violet-500/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
          {title.charAt(0)}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-950 group-hover:text-violet-700">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <p className="mt-5 text-sm font-semibold text-violet-600">
          Manage →
        </p>
      </Card>
    </Link>
  );
}