import { redis } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth";
import type { TournamentMatch } from "@/types";

function matchesKey(tournamentId: string) {
  return `tournamentMatches:${tournamentId}`;
}

function matchKey(id: string) {
  return `tournamentMatch:${id}`;
}

export const MAX_MATCHES_PER_PAIR = 4;

export function getFixtureMatchCount(
  matches: Array<{ teamAId: string; teamBId: string }>,
  teamAId: string,
  teamBId: string,
) {
  return matches.filter((match) => {
    const sameOrder = match.teamAId === teamAId && match.teamBId === teamBId;
    const reverseOrder = match.teamAId === teamBId && match.teamBId === teamAId;
    return sameOrder || reverseOrder;
  }).length;
}

export async function getTournamentMatches(
  tournamentId: string,
): Promise<TournamentMatch[]> {
  const ids = await redis.smembers(matchesKey(tournamentId));

  if (!ids.length) {
    return [];
  }

  const matches = await Promise.all(
    ids.map((id) => redis.get<TournamentMatch>(matchKey(id))),
  );

  return matches
    .filter((match): match is TournamentMatch => match !== null)
    .sort((a, b) => a.playedAt.localeCompare(b.playedAt));
}

export async function saveTournamentMatch(
  tournamentId: string,
  teamAId: string,
  teamBId: string,
  teamAScore: number,
  teamBScore: number,
  playedAt: string = new Date().toISOString(),
): Promise<TournamentMatch> {
  await requireAdmin();

  if (!teamAId || !teamBId) {
    throw new Error("Both teams are required.");
  }

  if (teamAId === teamBId) {
    throw new Error("Teams must be different.");
  }

  const existingMatches = await getTournamentMatches(tournamentId);
  const fixtureMatchCount = getFixtureMatchCount(existingMatches, teamAId, teamBId);

  if (fixtureMatchCount >= MAX_MATCHES_PER_PAIR) {
    throw new Error(`This fixture already has ${MAX_MATCHES_PER_PAIR} recorded results.`);
  }

  const match: TournamentMatch = {
    id: crypto.randomUUID(),
    tournamentId,
    teamAId,
    teamBId,
    teamAScore,
    teamBScore,
    playedAt,
    createdAt: new Date().toISOString(),
  };

  await redis.set(matchKey(match.id), match);
  await redis.sadd(matchesKey(tournamentId), match.id);

  return match;
}

export async function getTournamentMatchById(matchId: string): Promise<TournamentMatch | null> {
  return redis.get<TournamentMatch>(matchKey(matchId));
}

export async function updateTournamentMatch(
  matchId: string,
  teamAScore: number,
  teamBScore: number,
): Promise<TournamentMatch> {
  await requireAdmin();

  const existing = await getTournamentMatchById(matchId);

  if (!existing) {
    throw new Error("Match not found.");
  }

  const updated: TournamentMatch = {
    ...existing,
    teamAScore,
    teamBScore,
  };

  await redis.set(matchKey(matchId), updated);

  return updated;
}

export async function deleteTournamentMatch(
  matchId: string,
  tournamentId: string,
): Promise<TournamentMatch | null> {
  await requireAdmin();

  const existing = await getTournamentMatchById(matchId);

  if (!existing || existing.tournamentId !== tournamentId) {
    return null;
  }

  await redis.del(matchKey(matchId));
  await redis.srem(matchesKey(tournamentId), matchId);

  return existing;
}

export function generateRoundRobinSchedule(tournamentTeamIds: string[]) {
  const ids = [...tournamentTeamIds];

  if (ids.length < 2) {
    return [] as Array<{ round: number; teamAId: string; teamBId: string }>;
  }

  const rotation = [...ids];
  const rounds: Array<{ round: number; teamAId: string; teamBId: string }> = [];

  const totalTeams = rotation.length;
  const isOdd = totalTeams % 2 !== 0;

  if (isOdd) {
    rotation.push("__bye__");
  }

  const pairCount = rotation.length / 2;

  for (let roundIndex = 0; roundIndex < totalTeams - 1; roundIndex += 1) {
    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const teamA = rotation[pairIndex];
      const teamB = rotation[rotation.length - 1 - pairIndex];

      if (teamA === "__bye__" || teamB === "__bye__") {
        continue;
      }

      rounds.push({
        round: roundIndex + 1,
        teamAId: teamA,
        teamBId: teamB,
      });
    }

    const fixed = rotation[0];
    rotation.shift();
    rotation.push(fixed);
  }

  return rounds;
}

export function calculateStandingsFromMatches(
  tournamentTeamIds: string[],
  matches: TournamentMatch[],
) {
  const stats = new Map<
    string,
    {
      tournamentTeamId: string;
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }
  >();

  for (const tournamentTeamId of tournamentTeamIds) {
    stats.set(tournamentTeamId, {
      tournamentTeamId,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    const teamAStats = stats.get(match.teamAId);
    const teamBStats = stats.get(match.teamBId);

    if (!teamAStats || !teamBStats) {
      continue;
    }

    teamAStats.played += 1;
    teamBStats.played += 1;
    teamAStats.goalsFor += match.teamAScore;
    teamAStats.goalsAgainst += match.teamBScore;
    teamBStats.goalsFor += match.teamBScore;
    teamBStats.goalsAgainst += match.teamAScore;

    if (match.teamAScore > match.teamBScore) {
      teamAStats.wins += 1;
      teamAStats.points += 3;
      teamBStats.losses += 1;
    } else if (match.teamBScore > match.teamAScore) {
      teamBStats.wins += 1;
      teamBStats.points += 3;
      teamAStats.losses += 1;
    } else {
      teamAStats.draws += 1;
      teamBStats.draws += 1;
      teamAStats.points += 1;
      teamBStats.points += 1;
    }
  }

  return [...stats.values()]
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      const goalDifferenceA = a.goalsFor - a.goalsAgainst;
      const goalDifferenceB = b.goalsFor - b.goalsAgainst;

      if (goalDifferenceB !== goalDifferenceA) {
        return goalDifferenceB - goalDifferenceA;
      }

      return b.goalsFor - a.goalsFor;
    })
    .map((stat, index) => ({
      tournamentTeamId: stat.tournamentTeamId,
      position: index + 1,
      played: stat.played,
      wins: stat.wins,
      draws: stat.draws,
      losses: stat.losses,
      goalsFor: stat.goalsFor,
      goalsAgainst: stat.goalsAgainst,
      points: stat.points,
    }));
}
