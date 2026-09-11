import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/Card";
import { StandingsTable } from "@/components/statistics/StandingsTable";

import { getPlayers } from "@/lib/players";
import { getTournamentPlayoffs } from "@/lib/playoffs";
import { getTournamentStandings } from "@/lib/standings";
import { getTeams } from "@/lib/teams";
import {
  getTournamentById,
  getTournamentTeamDetails,
} from "@/lib/tournaments";

import type { Player, Team, TournamentStanding } from "@/types";

export const dynamic = "force-dynamic";

type PublicTournamentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PublicTournamentPage({
  params,
}: PublicTournamentPageProps) {
  const { id } = await params;

  const [tournament, teams, standings, playoffs, players] = await Promise.all([
    getTournamentById(id),
    getTeams(),
    getTournamentStandings(id),
    getTournamentPlayoffs(id),
    getPlayers(),
  ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails = await getTournamentTeamDetails(id, teams);

  const standingsWithTeams = standings
    .map((standing) => {
      const details = tournamentTeamDetails.find(
        (item) => item.tournamentTeam.id === standing.tournamentTeamId,
      );

      if (!details) {
        return null;
      }

      return {
        standing,
        team: details.team,
        tournamentTeam: details.tournamentTeam,
      };
    })
    .filter(
      (
        item,
      ): item is {
        standing: TournamentStanding;
        team: Team;
        tournamentTeam: (typeof tournamentTeamDetails)[number]["tournamentTeam"];
      } => item !== null,
    )
    .sort((a, b) => a.standing.position - b.standing.position);

  const champion = resolveChampion(standings, teams, tournamentTeamDetails, playoffs);
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const playoffSummary = [...playoffs].sort((a, b) => {
    if (a.stage !== b.stage) {
      return a.stage === "semi_final" ? -1 : 1;
    }

    return a.number - b.number;
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-violet-600 transition hover:text-violet-700"
        >
          ← Takaisin yhteenvetoon
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-950/10">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-violet-600/15 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
                Tournament #{tournament.number}
              </p>

              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    {tournament.name}
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                    <span>{formatDateShort(tournament.startDate)}</span>
                    <span>→</span>
                    <span>{formatDateShort(tournament.endDate)}</span>
                  </div>
                </div>

                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-xl font-black shadow-lg shadow-violet-600/20">
                  {tournament.number}
                </div>
              </div>
            </div>
          </div>
        </section>

        {champion && (
          <section className="mt-6">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                Mestari
              </p>

              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl shadow-lg shadow-violet-600/10">
                  🏆
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{champion.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">Turnauksen voittaja</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Joukkueet
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Pelaajat joukkueittain</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tournamentTeamDetails
              .slice()
              .sort((a, b) => a.team.name.localeCompare(b.team.name))
              .map(({ team, tournamentTeam }) => {
                const roster = tournamentTeam.playerIds
                  .map((playerId) => playerMap.get(playerId))
                  .filter((player): player is Player => Boolean(player))
                  .map((player) => player.nickname?.trim() || player.name);

                return (
                  <Card key={team.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-slate-950">{team.name}</h3>
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                        {roster.length} pelaajaa
                      </span>
                    </div>

                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {roster.length ? (
                        roster.map((playerName) => (
                          <li key={`${team.id}-${playerName}`} className="rounded-lg bg-slate-50 px-3 py-2">
                            {playerName}
                          </li>
                        ))
                      ) : (
                        <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-slate-500">
                          Ei pelaajia
                        </li>
                      )}
                    </ul>
                  </Card>
                );
              })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
              Sijoitukset
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Lopullinen taulukko</h2>
          </div>

          <StandingsTable rows={standingsWithTeams} />
        </section>

        {playoffSummary.length > 0 && (
          <section className="mt-8 pb-12">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                Pudotuspelit
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Tulokset</h2>
            </div>

            <div className="space-y-4">
              {playoffSummary.map((playoff) => {
                const teamA = teams.find((team: Team) => team.id === playoff.teamAId);
                const teamB = teams.find((team: Team) => team.id === playoff.teamBId);

                const teamAScore = playoff.leg1TeamAScore;
                const teamBScore = playoff.leg1TeamBScore;
                const teamASecondScore = playoff.leg2TeamAScore;
                const teamBSecondScore = playoff.leg2TeamBScore;

                const winnerId = getWinnerTeamId(playoff);

                return (
                  <Card key={`${playoff.stage}-${playoff.number}`} className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
                        {playoff.stage === "semi_final"
                          ? `Välierä ${playoff.number}`
                          : "Finaali"}
                      </p>

                      {winnerId && teamA && teamB && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                          Voittaja: {winnerId === teamA.id ? teamA.name : teamB.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <PlayoffTeamCard
                        team={teamA}
                        score={teamAScore}
                        secondLegScore={teamASecondScore}
                        isWinner={winnerId === teamA?.id}
                        isFinal={playoff.stage === "final"}
                      />

                      <PlayoffTeamCard
                        team={teamB}
                        score={teamBScore}
                        secondLegScore={teamBSecondScore}
                        isWinner={winnerId === teamB?.id}
                        isFinal={playoff.stage === "final"}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function resolveChampion(
  standings: TournamentStanding[],
  teams: Team[],
  tournamentTeamDetails: Awaited<ReturnType<typeof getTournamentTeamDetails>>,
  playoffs: Awaited<ReturnType<typeof getTournamentPlayoffs>>,
) {
  const final = playoffs.find((playoff: Awaited<ReturnType<typeof getTournamentPlayoffs>>[number]) => playoff.stage === "final");

  if (final && final.leg1TeamAScore !== null && final.leg1TeamBScore !== null) {
    const winnerId = getWinnerTeamId(final);

    if (winnerId) {
      const winnerTeam = teams.find((team: Team) => team.id === winnerId);

      if (winnerTeam) {
        return winnerTeam;
      }
    }
  }

  const firstPlaceStanding = standings.find((standing) => standing.position === 1);

  if (!firstPlaceStanding) {
    return null;
  }

  return (
    tournamentTeamDetails.find(
      (item) => item.tournamentTeam.id === firstPlaceStanding.tournamentTeamId,
    )?.team ?? null
  );
}

function getWinnerTeamId(playoff: Awaited<ReturnType<typeof getTournamentPlayoffs>>[number]) {
  const teamAScore = playoff.leg1TeamAScore;
  const teamBScore = playoff.leg1TeamBScore;
  const teamASecondScore = playoff.leg2TeamAScore;
  const teamBSecondScore = playoff.leg2TeamBScore;

  if (teamAScore === null || teamBScore === null) {
    return null;
  }

  if (teamASecondScore === null && teamBSecondScore === null) {
    if (teamAScore > teamBScore) {
      return playoff.teamAId;
    }

    if (teamBScore > teamAScore) {
      return playoff.teamBId;
    }

    return null;
  }

  if (teamASecondScore === null || teamBSecondScore === null) {
    return null;
  }

  const teamASum = teamAScore + teamASecondScore;
  const teamBSum = teamBScore + teamBSecondScore;

  if (teamASum > teamBSum) {
    return playoff.teamAId;
  }

  if (teamBSum > teamASum) {
    return playoff.teamBId;
  }

  return null;
}

function PlayoffTeamCard({
  team,
  score,
  secondLegScore,
  isWinner,
  isFinal,
}: {
  team?: Team;
  score: number | null;
  secondLegScore: number | null;
  isWinner: boolean;
  isFinal: boolean;
}) {
  const hasTwoLegs = score !== null && secondLegScore !== null;

  const displayScore =
    isFinal || !hasTwoLegs ? score : `${score ?? "—"} + ${secondLegScore ?? "—"}`;

  const total =
    score === null || secondLegScore === null || isFinal
      ? score
      : score + secondLegScore;

  return (
    <div
      className={[
        "rounded-2xl border p-4",
        isWinner ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-black text-slate-950">{team?.name ?? "TBD"}</p>
        {isWinner && (
          <span className="rounded-full bg-violet-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
            Winner
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
        {hasTwoLegs && !isFinal ? (
          <>
            <span className="rounded-lg bg-white px-2 py-1 font-bold text-slate-900">
              {score ?? "—"}
            </span>
            <span>+</span>
            <span className="rounded-lg bg-white px-2 py-1 font-bold text-slate-900">
              {secondLegScore ?? "—"}
            </span>
            <span className="font-semibold text-slate-900">= {total ?? "—"}</span>
          </>
        ) : (
          <>
            <span className="rounded-lg bg-white px-2 py-1 font-bold text-slate-900">
              {displayScore ?? "—"}
            </span>
            {!isFinal && total !== null && (
              <span className="font-semibold text-slate-900">= {total}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDateShort(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fi-FI", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
