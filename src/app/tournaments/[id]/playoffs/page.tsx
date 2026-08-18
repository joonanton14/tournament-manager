import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/Card";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";
import { SemiFinalForm } from "@/components/tournaments/SemiFinalForm";

import { getTeams } from "@/lib/teams";
import {
  getTournamentById,
  getTournamentTeamDetails,
} from "@/lib/tournaments";

import {
  getTournamentPlayoffs,
} from "@/lib/playoffs";

export const dynamic = "force-dynamic";

type PlayoffsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayoffsPage({
  params,
}: PlayoffsPageProps) {
  const { id } = await params;

  const [
    tournament,
    teams,
    playoffs,
  ] = await Promise.all([
    getTournamentById(id),
    getTeams(),
    getTournamentPlayoffs(id),
  ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails =
    await getTournamentTeamDetails(
      id,
      teams,
    );

  const tournamentTeams =
    tournamentTeamDetails.map(
      ({ team }) => team,
    );

  const semiFinal1 =
    playoffs.find(
      (playoff) =>
        playoff.stage === "semi_final" &&
        playoff.number === 1,
    );

  const semiFinal2 =
    playoffs.find(
      (playoff) =>
        playoff.stage === "semi_final" &&
        playoff.number === 2,
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

          <p className="mt-3 max-w-2xl text-slate-600">
            Enter the two-legged semi-finals and see
            which teams advance to the final.
          </p>
        </div>

        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="playoffs"
        />

        <div className="mt-8 space-y-8">
          {!tournamentTeams.length ? (
            <Card className="p-10 text-center">
              <p className="font-semibold text-slate-950">
                No teams available
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add teams to the tournament before setting
                up the semi-finals.
              </p>
            </Card>
          ) : tournamentTeams.length < 4 ? (
            <Card className="border-amber-200 bg-amber-50 p-6">
              <p className="font-semibold text-amber-900">
                You currently have{" "}
                {tournamentTeams.length} teams.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Normally the semi-finals require four
                tournament teams. You can still configure
                the page, but make sure the correct teams
                are available before saving.
              </p>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 bg-violet-50 p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                Semi-final 1
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                First semi-final
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Two games. Aggregate score decides who
                advances.
              </p>
            </div>

            <div className="p-6">
              <SemiFinalForm
                tournamentId={tournament.id}
                number={1}
                teams={tournamentTeams}
                existing={semiFinal1}
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 bg-violet-50 p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                Semi-final 2
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Second semi-final
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Two games. Aggregate score decides who
                advances.
              </p>
            </div>

            <div className="p-6">
              <SemiFinalForm
                tournamentId={tournament.id}
                number={2}
                teams={tournamentTeams}
                existing={semiFinal2}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}