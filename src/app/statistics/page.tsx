import Link from "next/link";

import { Card } from "@/components/Card";
import { TournamentSelector } from "@/components/statistics/TournamentSelector";
import { StandingsTable } from "@/components/statistics/StandingsTable";

import { getTeams } from "@/lib/teams";
import {
  getTournamentById,
  getTournamentTeamDetails,
  getTournaments,
} from "@/lib/tournaments";
import { getTournamentStandings } from "@/lib/standings";
import { getTournamentPlayoffs } from "@/lib/playoffs";

type StatisticsPageProps = {
  searchParams: Promise<{
    tournament?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fi-FI", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Helsinki",
  }).format(new Date(value));
}

export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  const params = await searchParams;

  const tournaments = await getTournaments();

  if (!tournaments.length) {
    return (
      <PublicStatisticsLayout>
        <EmptyStatisticsState />
      </PublicStatisticsLayout>
    );
  }

  const selectedTournamentId =
    params.tournament ??
    tournaments[tournaments.length - 1].id;

  const selectedTournament =
    await getTournamentById(
      selectedTournamentId,
    );

  if (!selectedTournament) {
    return (
      <PublicStatisticsLayout>
        <EmptyStatisticsState />
      </PublicStatisticsLayout>
    );
  }

  // Get the teams first.
  const teams = await getTeams();

  // Now it is safe to use teams.
  const [
    standings,
    tournamentTeamDetails,
    playoffs,
  ] = await Promise.all([
    getTournamentStandings(
      selectedTournament.id,
    ),

    getTournamentTeamDetails(
      selectedTournament.id,
      teams,
    ),

    getTournamentPlayoffs(
      selectedTournament.id,
    ),
  ]);

  const standingsWithTeams =
    standings
      .map((standing) => {
        const details =
          tournamentTeamDetails.find(
            (item) =>
              item.tournamentTeam.id ===
              standing.tournamentTeamId,
          );

        if (!details) {
          return null;
        }

        return {
          standing,
          team: details.team,
          tournamentTeam:
            details.tournamentTeam,
        };
      })
      .filter(
        (
          item,
        ): item is {
          standing: (typeof standings)[number];
          team: (typeof teams)[number];
          tournamentTeam: (typeof tournamentTeamDetails)[number]["tournamentTeam"];
        } => item !== null,
      )
      .sort(
        (a, b) =>
          a.standing.position -
          b.standing.position,
      );

  const final = playoffs.find(
    (playoff) =>
      playoff.stage === "final",
  );

  let champion:
    | (typeof teams)[number]
    | undefined;

  if (
    final &&
    final.leg1TeamAScore !== null &&
    final.leg1TeamBScore !== null
  ) {
    if (
      final.leg1TeamAScore >
      final.leg1TeamBScore
    ) {
      champion = teams.find(
        (team) =>
          team.id === final.teamAId,
      );
    } else if (
      final.leg1TeamBScore >
      final.leg1TeamAScore
    ) {
      champion = teams.find(
        (team) =>
          team.id === final.teamBId,
      );
    }
  }

  return (
    <PublicStatisticsLayout>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-400">
            Public statistics
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Tournament history
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Explore the results and regular-season
            standings from the FIFA tournaments.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <Card className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                Selected tournament
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {selectedTournament.name}
              </h2>

              <div className="mt-3 space-y-1 text-sm text-slate-500">
                <p>
                  Start:{" "}
                  {formatDateTime(
                    selectedTournament.startDate,
                  )}
                </p>

                <p>
                  End:{" "}
                  {formatDateTime(
                    selectedTournament.endDate,
                  )}
                </p>
              </div>
            </div>

            <TournamentSelector
              tournaments={tournaments}
              selectedTournamentId={
                selectedTournament.id
              }
            />
          </div>
        </Card>
      </section>

      {champion && (
        <section className="mt-8">
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Tournament champion
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl">
                🏆
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {champion.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tournament #
                  {selectedTournament.number}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
            Regular season
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Final standings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The final regular-season table for this
            tournament.
          </p>
        </div>

        <StandingsTable
          rows={standingsWithTeams}
        />
      </section>

      <section className="mt-8 pb-16">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Tournament information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <InfoItem
              label="Tournament"
              value={`#${selectedTournament.number}`}
            />

            <InfoItem
              label="Teams"
              value={String(
                tournamentTeamDetails.length,
              )}
            />

            <InfoItem
              label="Standings"
              value={
                standings.length
                  ? "Available"
                  : "Not entered"
              }
            />
          </div>
        </Card>
      </section>
    </PublicStatisticsLayout>
  );
}

function PublicStatisticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {children}
      </div>
    </div>
  );
}

function EmptyStatisticsState() {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-xl">
        📊
      </div>

      <h1 className="mt-5 text-2xl font-bold text-slate-950">
        No statistics available yet
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Tournament statistics will appear here when
        tournaments and standings have been entered.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Back home
      </Link>
    </Card>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}