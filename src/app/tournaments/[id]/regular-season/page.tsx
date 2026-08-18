import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/Card";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";
import { RegularSeasonTable } from "@/components/tournaments/RegularSeasonTable";

import { getTeams } from "@/lib/teams";
import { getTournamentById, getTournamentTeamDetails } from "@/lib/tournaments";
import { getTournamentStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

type RegularSeasonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RegularSeasonPage({
  params,
}: RegularSeasonPageProps) {
  const { id } = await params;

  const [tournament, teams, standings] =
    await Promise.all([
      getTournamentById(id),
      getTeams(),
      getTournamentStandings(id),
    ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails =
    await getTournamentTeamDetails(
      id,
      teams,
    );

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/tournaments"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to tournaments
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Tournament #{tournament.number}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {tournament.name}
          </h1>

          <p className="mt-3 text-slate-600">
            Enter the final regular-season table.
          </p>
        </div>

        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="regular-season"
        />

        <section className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Regular-season final table
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                The historical tournaments can be entered
                manually. We don't need the individual regular-season
                matches if you only have the final table.
              </p>
            </div>

            <RegularSeasonTable
              tournamentId={tournament.id}
              tournamentTeams={
                tournamentTeamDetails
              }
              standings={standings}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}