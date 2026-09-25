import { redis } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth";

import type {
  Team,
  Tournament,
  TournamentTeam,
} from "@/types";

const TOURNAMENTS_KEY = "tournaments";

function tournamentKey(id: string) {
  return `tournament:${id}`;
}

function tournamentTeamsKey(
  tournamentId: string,
) {
  return `tournamentTeams:${tournamentId}`;
}

function tournamentTeamKey(id: string) {
  return `tournamentTeam:${id}`;
}

export async function getTournaments(): Promise<
  Tournament[]
> {
  const ids = await redis.smembers(
    TOURNAMENTS_KEY,
  );

  if (!ids.length) {
    return [];
  }

  const tournaments = await Promise.all(
    ids.map((id) =>
      redis.get<Tournament>(
        tournamentKey(id),
      ),
    ),
  );

  return tournaments
    .filter(
      (
        tournament,
      ): tournament is Tournament =>
        tournament !== null,
    )
    .sort(
      (a, b) => a.number - b.number,
    );
}

export async function getTournamentById(
  id: string,
): Promise<Tournament | null> {
  return redis.get<Tournament>(
    tournamentKey(id),
  );
}

export async function createTournament(
  number: number,
  name: string,
  mode: "completed" | "live",
  startDate: string,
  endDate: string,
): Promise<Tournament> {
  await requireAdmin();

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error(
      "Tournament name is required.",
    );
  }

  if (!startDate) {
    throw new Error(
      "Tournament start date is required.",
    );
  }

  if (!endDate) {
    throw new Error(
      "Tournament end date is required.",
    );
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
    mode,
    startDate,
    endDate,
    createdAt:
      new Date().toISOString(),
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

export async function updateTournament(
  tournamentId: string,
  number: number,
  name: string,
  mode: "completed" | "live",
  startDate: string,
  endDate: string,
): Promise<Tournament> {
  await requireAdmin();

  const existing =
    await redis.get<Tournament>(
      tournamentKey(tournamentId),
    );

  if (!existing) {
    throw new Error(
      "Tournament not found.",
    );
  }

  if (!Number.isInteger(number) || number < 1) {
    throw new Error(
      "Tournament number must be a positive integer.",
    );
  }

  const tournaments = await getTournaments();
  const duplicateNumber = tournaments.find(
    (tournament) =>
      tournament.id !== tournamentId &&
      tournament.number === number,
  );

  if (duplicateNumber) {
    throw new Error(
      "Another tournament already uses that number.",
    );
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error(
      "Tournament name is required.",
    );
  }

  const updated: Tournament = {
    ...existing,
    number,
    name: trimmedName,
    mode,
    startDate,
    endDate,
  };

  await redis.set(
    tournamentKey(updated.id),
    updated,
  );

  return updated;
}

export async function deleteTournament(
  tournamentId: string,
): Promise<void> {
  await requireAdmin();

  const existing =
    await redis.get<Tournament>(
      tournamentKey(tournamentId),
    );

  if (!existing) {
    throw new Error(
      "Tournament not found.",
    );
  }

  const [tournamentTeams, standingsIds, matchesIds, playoffIds] = await Promise.all([
    getTournamentTeams(tournamentId),
    redis.smembers(`tournamentStandings:${tournamentId}`),
    redis.smembers(`tournamentMatches:${tournamentId}`),
    redis.smembers(`playoffs:${tournamentId}`),
  ]);

  for (const tournamentTeam of tournamentTeams) {
    await redis.del(
      tournamentTeamKey(
        tournamentTeam.id,
      ),
    );
  }

  for (const standingId of standingsIds) {
    await redis.del(`tournamentStanding:${standingId}`);
  }

  for (const matchId of matchesIds) {
    await redis.del(`tournamentMatch:${matchId}`);
  }

  for (const playoffId of playoffIds) {
    await redis.del(`playoff:${playoffId}`);
  }

  await redis.del(
    tournamentKey(tournamentId),
  );

  await redis.del(
    tournamentTeamsKey(tournamentId),
  );

  await redis.del(
    `tournamentStandings:${tournamentId}`,
  );

  await redis.del(
    `tournamentMatches:${tournamentId}`,
  );

  await redis.del(
    `playoffs:${tournamentId}`,
  );

  await redis.srem(
    TOURNAMENTS_KEY,
    tournamentId,
  );
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

  const tournamentTeams =
    await Promise.all(
      ids.map((id) =>
        redis.get<TournamentTeam>(
          tournamentTeamKey(id),
        ),
      ),
    );

  return tournamentTeams.filter(
    (
      item,
    ): item is TournamentTeam =>
      item !== null,
  );
}

export async function addTeamToTournament(
  tournamentId: string,
  teamId: string,
): Promise<TournamentTeam> {
  await requireAdmin();

  const teamsInTournament =
    await getTournamentTeams(
      tournamentId,
    );

  const existing =
    teamsInTournament.find(
      (item) =>
        item.teamId === teamId,
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
    tournamentTeamKey(
      tournamentTeam.id,
    ),
    tournamentTeam,
  );

  await redis.sadd(
    tournamentTeamsKey(
      tournamentId,
    ),
    tournamentTeam.id,
  );

  return tournamentTeam;
}

export async function assignPlayersToTournamentTeam(
  tournamentTeamId: string,
  playerIds: string[],
): Promise<TournamentTeam> {
  await requireAdmin();

  const existing =
    await redis.get<TournamentTeam>(
      tournamentTeamKey(
        tournamentTeamId,
      ),
    );

  if (!existing) {
    throw new Error(
      "Tournament team not found.",
    );
  }

  const tournamentTeams =
    await getTournamentTeams(
      existing.tournamentId,
    );

  const uniquePlayerIds = [
    ...new Set(playerIds),
  ];

  const alreadyAssigned =
    tournamentTeams
      .filter(
        (tournamentTeam) =>
          tournamentTeam.id !==
          tournamentTeamId,
      )
      .flatMap(
        (tournamentTeam) =>
          tournamentTeam.playerIds,
      )
      .some((playerId) =>
        uniquePlayerIds.includes(playerId),
      );

  if (alreadyAssigned) {
    throw new Error(
      "A player cannot be assigned to more than one team in the same tournament.",
    );
  }

  const updated: TournamentTeam = {
    ...existing,
    playerIds: uniquePlayerIds,
  };

  await redis.set(
    tournamentTeamKey(
      tournamentTeamId,
    ),
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
    await getTournamentTeams(
      tournamentId,
    );

  return tournamentTeams
    .map((tournamentTeam) => {
      const team = teams.find(
        (item) =>
          item.id ===
          tournamentTeam.teamId,
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
  await requireAdmin();

  const existing =
    await redis.get<TournamentTeam>(
      tournamentTeamKey(
        tournamentTeamId,
      ),
    );

  if (!existing) {
    throw new Error(
      "Tournament team not found.",
    );
  }

  const updated: TournamentTeam = {
    ...existing,
    teamId,
    playerIds: [],
  };

  await redis.set(
    tournamentTeamKey(
      tournamentTeamId,
    ),
    updated,
  );

  return updated;
}

export async function removeTeamFromTournament(
  tournamentTeamId: string,
): Promise<void> {
  await requireAdmin();

  const existing =
    await redis.get<TournamentTeam>(
      tournamentTeamKey(
        tournamentTeamId,
      ),
    );

  if (!existing) {
    throw new Error(
      "Tournament team not found.",
    );
  }

  await redis.del(
    tournamentTeamKey(
      tournamentTeamId,
    ),
  );

  await redis.srem(
    tournamentTeamsKey(
      existing.tournamentId,
    ),
    tournamentTeamId,
  );
}