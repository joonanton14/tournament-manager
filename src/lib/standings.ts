import { redis } from "@/lib/redis";
import type { TournamentStanding } from "@/types";

function standingsKey(tournamentId: string) {
  return `tournamentStandings:${tournamentId}`;
}

function standingKey(id: string) {
  return `tournamentStanding:${id}`;
}

export async function getTournamentStandings(
  tournamentId: string,
): Promise<TournamentStanding[]> {
  const ids = await redis.smembers(
    standingsKey(tournamentId),
  );

  if (!ids.length) {
    return [];
  }

  const standings = await Promise.all(
    ids.map((id) =>
      redis.get<TournamentStanding>(
        standingKey(id),
      ),
    ),
  );

  return standings
    .filter(
      (standing): standing is TournamentStanding =>
        standing !== null,
    )
    .sort((a, b) => a.position - b.position);
}

export async function saveTournamentStandings(
  tournamentId: string,
  rows: Array<{
    tournamentTeamId: string;
    position: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>,
): Promise<void> {
  const existing = await getTournamentStandings(
    tournamentId,
  );

  const existingByTeam = new Map(
    existing.map((standing) => [
      standing.tournamentTeamId,
      standing,
    ]),
  );

  const incomingTeamIds = new Set(
    rows.map((row) => row.tournamentTeamId),
  );

  // Remove standing records for teams no longer submitted.
  for (const standing of existing) {
    if (!incomingTeamIds.has(standing.tournamentTeamId)) {
      await redis.del(standingKey(standing.id));

      await redis.srem(
        standingsKey(tournamentId),
        standing.id,
      );
    }
  }

  for (const row of rows) {
    const existingStanding =
      existingByTeam.get(row.tournamentTeamId);

    const standing: TournamentStanding = {
      id:
        existingStanding?.id ??
        crypto.randomUUID(),
      tournamentId,
      tournamentTeamId: row.tournamentTeamId,
      position: row.position,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
      createdAt:
        existingStanding?.createdAt ??
        new Date().toISOString(),
    };

    await redis.set(
      standingKey(standing.id),
      standing,
    );

    await redis.sadd(
      standingsKey(tournamentId),
      standing.id,
    );
  }
}