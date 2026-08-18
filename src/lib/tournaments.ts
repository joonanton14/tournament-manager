import { redis } from "@/lib/redis";
import type {
  Team,
  Tournament,
  TournamentTeam,
} from "@/types";

const TOURNAMENTS_KEY = "tournaments";

function tournamentKey(id: string) {
  return `tournament:${id}`;
}

function tournamentTeamsKey(tournamentId: string) {
  return `tournamentTeams:${tournamentId}`;
}

function tournamentTeamKey(id: string) {
  return `tournamentTeam:${id}`;
}

export async function getTournaments(): Promise<Tournament[]> {
  const ids = await redis.smembers(TOURNAMENTS_KEY);

  if (!ids.length) {
    return [];
  }

  const tournaments = await Promise.all(
    ids.map((id) =>
      redis.get<Tournament>(tournamentKey(id)),
    ),
  );

  return tournaments
    .filter(
      (tournament): tournament is Tournament =>
        tournament !== null,
    )
    .sort((a, b) => a.number - b.number);
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | null> {
  return redis.get<Tournament>(tournamentKey(id));
}

export async function createTournament(
  number: number,
  name: string,
  startDate: string,
  endDate: string,
): Promise<Tournament> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Tournament name is required.");
  }

  if (!startDate) {
    throw new Error("Tournament start date is required.");
  }

  if (!endDate) {
    throw new Error("Tournament end date is required.");
  }

  if (endDate < startDate) {
    throw new Error(
      "Tournament end date cannot be before the start date.",
    );
  }

  const tournament: Tournament = {
    id: crypto.randomUUID(),
    number,
    name: trimmedName,
    startDate,
    endDate,
    createdAt: new Date().toISOString(),
  };

  await redis.set(
    tournamentKey(tournament.id),
    tournament,
  );

  await redis.sadd(
    TOURNAMENTS_KEY,
    tournament.id,
  );

  return tournament;
}

export async function getTournamentTeams(
  tournamentId: string,
): Promise<TournamentTeam[]> {
  const ids = await redis.smembers(
    tournamentTeamsKey(tournamentId),
  );

  if (!ids.length) {
    return [];
  }

  const tournamentTeams = await Promise.all(
    ids.map((id) =>
      redis.get<TournamentTeam>(
        tournamentTeamKey(id),
      ),
    ),
  );

  return tournamentTeams.filter(
    (item): item is TournamentTeam => item !== null,
  );
}

export async function addTeamToTournament(
  tournamentId: string,
  teamId: string,
): Promise<TournamentTeam> {
  const teamsInTournament =
    await getTournamentTeams(tournamentId);

  const existing = teamsInTournament.find(
    (item) => item.teamId === teamId,
  );

  if (existing) {
    return existing;
  }

  const tournamentTeam: TournamentTeam = {
    id: crypto.randomUUID(),
    tournamentId,
    teamId,
    playerIds: [],
  };

  await redis.set(
    tournamentTeamKey(tournamentTeam.id),
    tournamentTeam,
  );

  await redis.sadd(
    tournamentTeamsKey(tournamentId),
    tournamentTeam.id,
  );

  return tournamentTeam;
}

export async function assignPlayersToTournamentTeam(
  tournamentTeamId: string,
  playerIds: string[],
): Promise<TournamentTeam> {
  const existing = await redis.get<TournamentTeam>(
    tournamentTeamKey(tournamentTeamId),
  );

  if (!existing) {
    throw new Error("Tournament team not found.");
  }

  const updated: TournamentTeam = {
    ...existing,
    playerIds: [...new Set(playerIds)],
  };

  await redis.set(
    tournamentTeamKey(tournamentTeamId),
    updated,
  );

  return updated;
}

export async function getTournamentTeamDetails(
  tournamentId: string,
  teams: Team[],
): Promise<
  Array<{
    tournamentTeam: TournamentTeam;
    team: Team;
  }>
> {
  const tournamentTeams =
    await getTournamentTeams(tournamentId);

  return tournamentTeams
    .map((tournamentTeam) => {
      const team = teams.find(
        (item) => item.id === tournamentTeam.teamId,
      );

      if (!team) {
        return null;
      }

      return {
        tournamentTeam,
        team,
      };
    })
    .filter(
      (
        item,
      ): item is {
        tournamentTeam: TournamentTeam;
        team: Team;
      } => item !== null,
    );
}

export async function updateTournamentTeam(
  tournamentTeamId: string,
  teamId: string,
): Promise<TournamentTeam> {
  const existing = await redis.get<TournamentTeam>(
    tournamentTeamKey(tournamentTeamId),
  );

  if (!existing) {
    throw new Error("Tournament team not found.");
  }

  const updated: TournamentTeam = {
    ...existing,
    teamId,
    playerIds: [],
  };

  await redis.set(
    tournamentTeamKey(tournamentTeamId),
    updated,
  );

  return updated;
}

export async function removeTeamFromTournament(
  tournamentTeamId: string,
): Promise<void> {
  const existing = await redis.get<TournamentTeam>(
    tournamentTeamKey(tournamentTeamId),
  );

  if (!existing) {
    throw new Error("Tournament team not found.");
  }

  await redis.del(tournamentTeamKey(tournamentTeamId));

  await redis.srem(
    tournamentTeamsKey(existing.tournamentId),
    tournamentTeamId,
  );
}