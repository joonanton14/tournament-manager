import Link from "next/link";

import { Card } from "@/components/Card";

import { getPlayers } from "@/lib/players";
import { getTournamentPlayoffs } from "@/lib/playoffs";
import { getTournamentStandings } from "@/lib/standings";
import { getTeams } from "@/lib/teams";
import {
  getTournamentTeamDetails,
  getTournaments,
} from "@/lib/tournaments";

import type {
  Player,
  Team,
  Tournament,
  TournamentStanding,
} from "@/types";

type PlayerPerformance = {
  id: string;
  name: string;
  wins: number;
  secondPlaces: number;
  thirdPlaces: number;
};

type TournamentSummary = {
  tournament: Tournament;
  championName: string | null;
  standingsCount: number;
  playoffCount: number;
};

function getPlayerDisplayName(player: Player, nicknameCounts: Map<string, number>) {
  const nickname = player.nickname?.trim();

  if (!nickname) {
    return player.name;
  }

  const key = nickname.toLowerCase();

  if ((nicknameCounts.get(key) ?? 0) > 1) {
    return `${nickname} (${player.name})`;
  }

  return nickname;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [tournaments, players, teams] = await Promise.all([
    getTournaments(),
    getPlayers(),
    getTeams(),
  ]);

  const playerMap = new Map(players.map((player) => [player.id, player]));
  const nicknameCounts = new Map<string, number>();

  for (const player of players) {
    const nickname = player.nickname?.trim();

    if (!nickname) {
      continue;
    }

    const key = nickname.toLowerCase();
    nicknameCounts.set(key, (nicknameCounts.get(key) ?? 0) + 1);
  }

  const podiums = await getOverallPodiums(
    tournaments,
    teams,
    playerMap,
    nicknameCounts,
  );

  const tournamentSummaries = await Promise.all(
    tournaments.map(async (tournament) => {
      const [standings, tournamentTeamDetails, playoffs] = await Promise.all([
        getTournamentStandings(tournament.id),
        getTournamentTeamDetails(tournament.id, teams),
        getTournamentPlayoffs(tournament.id),
      ]);

      const championName = resolveChampionName(
        standings,
        tournamentTeamDetails,
        playoffs,
        teams,
      );

      return {
        tournament,
        championName,
        standingsCount: standings.length,
        playoffCount: playoffs.length,
      } satisfies TournamentSummary;
    }),
  );

  const latestTournament = tournamentSummaries.at(-1) ?? null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="rounded-3xl border border-violet-200 bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.22),_transparent_45%),linear-gradient(135deg,#0f172a,#111827)] p-6 text-white shadow-xl shadow-violet-900/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
                Turnauskeskus
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                Turnausten yhteenveto
              </h1>
            </div>

            <Link
              href="/statistics"
              className="inline-flex items-center justify-center rounded-xl border border-violet-400/40 bg-white/5 px-4 py-2.5 text-sm font-semibold text-violet-100 transition hover:bg-white/10"
            >
              Avaa tilastot
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Turnaukset"
            value={String(tournaments.length)}
            detail="Pelattu historia"
          />
          <MetricCard
            label="Pelaajat"
            value={String(players.length)}
            detail="Seuratut pelaajat"
          />
          <MetricCard
            label="Eniten voittoja"
            value={podiums.wins[0]?.name ?? "—"}
            detail={
              podiums.wins[0]
                ? `${podiums.wins[0].wins} voittoa`
                : "Ei tuloksia vielä"
            }
          />
          <MetricCard
            label="Viimeinen finaali"
            value={latestTournament?.championName ?? "Keskeneräinen"}
            detail={
              latestTournament
                ? `Turnaus #${latestTournament.tournament.number}`
                : "Ei turnausta vielä"
            }
          />
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <LeaderboardCard
              title="Eniten voittoja"
              icon="🏆"
              players={podiums.wins}
              valueKey="wins"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <LeaderboardCard
                title="Toiset sijat"
                icon="🥈"
                players={podiums.secondPlaces}
                valueKey="secondPlaces"
              />

              <LeaderboardCard
                title="Kolmannet sijat"
                icon="🥉"
                players={podiums.thirdPlaces}
                valueKey="thirdPlaces"
              />
            </div>
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                  Viimeinen turnaus
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  {latestTournament?.tournament.name ?? "Ei turnausta"}
                </h2>
              </div>

              {latestTournament && (
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                  #{latestTournament.tournament.number}
                </span>
              )}
            </div>

            {latestTournament ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Mestari
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {latestTournament.championName ?? "Keskeneräinen"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoChip label="Sijoitukset" value={String(latestTournament.standingsCount)} />
                  <InfoChip label="Pudotuspelit" value={String(latestTournament.playoffCount)} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Päivämäärät</p>
                  <p className="mt-2">
                    {formatDateShort(latestTournament.tournament.startDate)}
                    <span className="mx-2">→</span>
                    {formatDateShort(latestTournament.tournament.endDate)}
                  </p>
                </div>

                <Link
                  href={`/public/tournaments/${latestTournament.tournament.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Avaa turnaus
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Lisää turnaus aloittaaksesi historiallisen katsauksen.
              </div>
            )}
          </Card>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                Historia
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Pelatut turnaukset
              </h2>
            </div>
          </div>

          {tournamentSummaries.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tournamentSummaries.map(({ tournament, championName, standingsCount, playoffCount }) => (
                <Link
                  key={tournament.id}
                  href={`/public/tournaments/${tournament.id}`}
                  className="group"
                >
                  <Card className="h-full p-4 transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:shadow-lg group-hover:shadow-violet-500/10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
                          Turnaus #{tournament.number}
                        </p>
                        <h3 className="mt-2 text-lg font-black text-slate-950">
                          {tournament.name}
                        </h3>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                        {standingsCount ? "Pelattu" : "Luonnos"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-900">Mestari:</span>{" "}
                        {championName ?? "Keskeneräinen"}
                      </p>
                      <p>
                        {formatDateShort(tournament.startDate)}
                        <span className="mx-2 text-slate-400">→</span>
                        {formatDateShort(tournament.endDate)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-500">
                      <div className="rounded-xl bg-slate-50 px-2 py-2">
                        <div className="text-lg font-black text-slate-950">{standingsCount}</div>
                        <div>Sijoitus</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-2">
                        <div className="text-lg font-black text-slate-950">{playoffCount}</div>
                        <div>Pudotuspelit</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-2 py-2">
                        <div className="text-lg font-black text-slate-950">{championName ? "✓" : "—"}</div>
                        <div>Tulos</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-violet-600">
                      <span>Avaa turnaus</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-lg font-bold text-slate-900">Ei turnauksia vielä</p>
              <p className="mt-2 text-sm text-slate-500">
                Luo ensimmäinen turnaus aloittaaksesi tulosten seuraamisen.
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

async function getOverallPodiums(
  tournaments: Tournament[],
  teams: Team[],
  playerMap: Map<string, Player>,
  nicknameCounts: Map<string, number>,
) {
  const playerStats = new Map<string, PlayerPerformance>();

  for (const tournament of tournaments) {
    const [standings, tournamentTeamDetails, playoffs] = await Promise.all([
      getTournamentStandings(tournament.id),
      getTournamentTeamDetails(tournament.id, teams),
      getTournamentPlayoffs(tournament.id),
    ]);

    const regularSeasonTeamPositions = new Map<string, number>();

    for (const standing of standings) {
      const tournamentTeam = tournamentTeamDetails.find(
        (detail) => detail.tournamentTeam.id === standing.tournamentTeamId,
      );

      if (tournamentTeam) {
        regularSeasonTeamPositions.set(tournamentTeam.team.id, standing.position);
      }
    }

    const thirdPlaceTeamId = resolveThirdPlaceTeamId(
      standings,
      tournamentTeamDetails,
      playoffs,
      regularSeasonTeamPositions,
    );

    const tournamentPlayerIdsForThirdPlace =
      thirdPlaceTeamId === null
        ? []
        : (
            tournamentTeamDetails.find(
              (detail) => detail.team.id === thirdPlaceTeamId,
            )?.tournamentTeam.playerIds ?? []
          );

    const processedPlayerIds = new Set<string>();
    const tournamentPlayerIdsSeenThisTournament = new Set<string>();

    for (const standing of standings) {
      const tournamentTeamDetailsForStanding = tournamentTeamDetails.find(
        (detail) => detail.tournamentTeam.id === standing.tournamentTeamId,
      );

      const playerIds = tournamentTeamDetailsForStanding?.tournamentTeam.playerIds ?? [];

      for (const playerId of playerIds) {
        const player = playerMap.get(playerId);

        if (!player || tournamentPlayerIdsSeenThisTournament.has(player.id)) {
          continue;
        }

        tournamentPlayerIdsSeenThisTournament.add(player.id);

        const displayName = getPlayerDisplayName(player, nicknameCounts);
        const current = playerStats.get(player.id) ?? {
          id: player.id,
          name: displayName,
          wins: 0,
          secondPlaces: 0,
          thirdPlaces: 0,
        };

        if (standing.position === 1) {
          current.wins += 1;
        } else if (standing.position === 2) {
          current.secondPlaces += 1;
        }

        if (
          thirdPlaceTeamId !== null &&
          tournamentPlayerIdsForThirdPlace.includes(playerId) &&
          !processedPlayerIds.has(player.id)
        ) {
          current.thirdPlaces += 1;
          processedPlayerIds.add(player.id);
        }

        playerStats.set(player.id, current);
      }
    }
  }

  return {
    wins: [...playerStats.values()].sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name)).slice(0, 3),
    secondPlaces: [...playerStats.values()]
      .sort((a, b) => b.secondPlaces - a.secondPlaces || a.name.localeCompare(b.name))
      .slice(0, 3),
    thirdPlaces: [...playerStats.values()]
      .sort((a, b) => b.thirdPlaces - a.thirdPlaces || a.name.localeCompare(b.name))
      .slice(0, 3),
  };
}

function resolveThirdPlaceTeamId(
  standings: TournamentStanding[],
  tournamentTeamDetails: Awaited<ReturnType<typeof getTournamentTeamDetails>>,
  playoffs: Awaited<ReturnType<typeof getTournamentPlayoffs>>,
  regularSeasonTeamPositions: Map<string, number>,
) {
  const semifinalLosers = new Map<string, number>();

  for (const semifinal of playoffs.filter((playoff) => playoff.stage === "semi_final")) {
    const teamAScore = semifinal.leg1TeamAScore;
    const teamBScore = semifinal.leg1TeamBScore;
    const teamASecondScore = semifinal.leg2TeamAScore;
    const teamBSecondScore = semifinal.leg2TeamBScore;

    if (
      teamAScore === null ||
      teamBScore === null ||
      teamASecondScore === null ||
      teamBSecondScore === null
    ) {
      continue;
    }

    const teamASum = teamAScore + teamASecondScore;
    const teamBSum = teamBScore + teamBSecondScore;

    const winnerId = teamASum > teamBSum ? semifinal.teamAId : semifinal.teamBId;
    const loserId = winnerId === semifinal.teamAId ? semifinal.teamBId : semifinal.teamAId;

    semifinalLosers.set(loserId, regularSeasonTeamPositions.get(loserId) ?? Number.POSITIVE_INFINITY);
  }

  const loserIds = [...semifinalLosers.keys()];

  if (loserIds.length < 2) {
    const fallbackThirdPlaceStanding = standings.find((standing) => standing.position === 3);

    if (!fallbackThirdPlaceStanding) {
      return null;
    }

    const fallbackTeam = tournamentTeamDetails.find(
      (detail) => detail.tournamentTeam.id === fallbackThirdPlaceStanding.tournamentTeamId,
    );

    return fallbackTeam?.team.id ?? null;
  }

  const [firstLoserId, secondLoserId] = loserIds;
  const firstLoserPos = semifinalLosers.get(firstLoserId) ?? Number.POSITIVE_INFINITY;
  const secondLoserPos = semifinalLosers.get(secondLoserId) ?? Number.POSITIVE_INFINITY;

  return firstLoserPos <= secondLoserPos ? firstLoserId : secondLoserId;
}

function resolveChampionName(
  standings: TournamentStanding[],
  tournamentTeamDetails: Awaited<ReturnType<typeof getTournamentTeamDetails>>,
  playoffs: Awaited<ReturnType<typeof getTournamentPlayoffs>>,
  teams: Team[],
) {
  const final = playoffs.find((playoff) => playoff.stage === "final");

  if (final) {
    const teamAScore = final.leg1TeamAScore;
    const teamBScore = final.leg1TeamBScore;

    if (teamAScore !== null && teamBScore !== null) {
      const winnerId = teamAScore > teamBScore ? final.teamAId : final.teamBId;
      const winnerTeam = teams.find((team) => team.id === winnerId);

      if (winnerTeam) {
        return winnerTeam.name;
      }
    }
  }

  const firstPlaceStanding = standings.find((standing) => standing.position === 1);

  if (!firstPlaceStanding) {
    return null;
  }

  const firstPlaceTeam = tournamentTeamDetails.find(
    (detail) => detail.tournamentTeam.id === firstPlaceStanding.tournamentTeamId,
  )?.team;

  return firstPlaceTeam?.name ?? null;
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

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}

type LeaderboardCardProps = {
  title: string;
  icon: string;
  players: PlayerPerformance[];
  valueKey: "wins" | "secondPlaces" | "thirdPlaces";
};

function LeaderboardCard({ title, icon, players, valueKey }: LeaderboardCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">{icon}</span>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
      </div>

      <div className="mt-4 space-y-3">
        {players.length ? (
          players.map((player, index) => (
            <div
              key={`${title}-${player.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-900">{player.name}</span>
              </div>

              <span className="text-sm font-black text-slate-950">
                {player[valueKey]}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
            No results yet.
          </p>
        )}
      </div>
    </Card>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}