import Link from "next/link";
import { Card } from "@/components/Card";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { getTournaments } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Ei määritetty";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Ei määritetty";
  }

  return new Intl.DateTimeFormat("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Helsinki",
  }).format(date);
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments();

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Kilpailu
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Turnaukset
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Luo ja hallitse FIFA-turnauksiasi.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <Card className="h-fit p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-950">
                Luo turnaus
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Aseta turnauksen numero, nimi ja
                aikataulu.
              </p>
            </div>

            <TournamentForm />
          </Card>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-950">
                Turnauksen historia
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {tournaments.length}{" "}
                {tournaments.length === 1
                  ? "tournament"
                  : "tournaments"}
              </p>
            </div>

            {tournaments.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {tournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="group"
                  >
                    <Card className="h-full p-6 transition group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:shadow-lg group-hover:shadow-violet-500/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-violet-600">
                            Tournament #
                            {tournament.number}
                          </p>

                          <h3 className="mt-2 text-xl font-bold text-slate-950 group-hover:text-violet-700">
                            {tournament.name}
                          </h3>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
                          {tournament.number}
                        </div>
                      </div>

                      <div className="mt-5 space-y-1 text-sm text-slate-500">
                        <p>
                          Start:{" "}
                          {formatDateTime(
                            tournament.startDate,
                          )}
                        </p>

                        <p>
                          End:{" "}
                          {formatDateTime(
                            tournament.endDate,
                          )}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="font-semibold text-slate-950">
                  Ei vielä turnauksia
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Luo turnaus aloittaaksesi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}