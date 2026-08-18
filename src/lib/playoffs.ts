import { redis } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth";
import type { PlayoffTie } from "@/types";

const PLAYOFFS_KEY = (
  tournamentId: string,
) =>
  `playoffs:${tournamentId}`;

const playoffKey = (id: string) =>
  `playoff:${id}`;

export async function getTournamentPlayoffs(
  tournamentId: string,
): Promise<PlayoffTie[]> {
  const ids = await redis.smembers(
    PLAYOFFS_KEY(tournamentId),
  );

  if (!ids.length) {
    return [];
  }

  const playoffs = await Promise.all(
    ids.map((id) =>
      redis.get<PlayoffTie>(
        playoffKey(id),
      ),
    ),
  );

  return playoffs
    .filter(
      (playoff): playoff is PlayoffTie =>
        playoff !== null,
    )
    .sort((a, b) => {
      if (a.stage === b.stage) {
        return a.number - b.number;
      }

      return a.stage ===
        "semi_final"
        ? -1
        : 1;
    });
}

export async function saveSemiFinal(
  tournamentId: string,
  number: number,
  teamAId: string,
  teamBId: string,
  leg1TeamAScore: number | null,
  leg1TeamBScore: number | null,
  leg2TeamAScore: number | null,
  leg2TeamBScore: number | null,
): Promise<PlayoffTie> {
  await requireAdmin();

  if (!teamAId || !teamBId) {
    throw new Error(
      "Both semi-final teams are required.",
    );
  }

  if (teamAId === teamBId) {
    throw new Error(
      "Semi-final teams must be different.",
    );
  }

  const existingPlayoffs =
    await getTournamentPlayoffs(
      tournamentId,
    );

  const existing =
    existingPlayoffs.find(
      (playoff) =>
        playoff.stage ===
          "semi_final" &&
        playoff.number === number,
    );

  const playoff: PlayoffTie = {
    id:
      existing?.id ??
      crypto.randomUUID(),

    tournamentId,
    stage: "semi_final",
    number,

    teamAId,
    teamBId,

    leg1TeamAScore,
    leg1TeamBScore,

    leg2TeamAScore,
    leg2TeamBScore,

    createdAt:
      existing?.createdAt ??
      new Date().toISOString(),
  };

  await redis.set(
    playoffKey(playoff.id),
    playoff,
  );

  await redis.sadd(
    PLAYOFFS_KEY(tournamentId),
    playoff.id,
  );

  return playoff;
}

export async function saveFinal(
  tournamentId: string,
  teamAId: string,
  teamBId: string,
  teamAScore: number | null,
  teamBScore: number | null,
): Promise<PlayoffTie> {
  await requireAdmin();

  if (!teamAId || !teamBId) {
    throw new Error(
      "Both finalists are required.",
    );
  }

  if (teamAId === teamBId) {
    throw new Error(
      "Finalists must be different.",
    );
  }

  if (
    teamAScore !== null &&
    teamAScore < 0
  ) {
    throw new Error(
      "Invalid home score.",
    );
  }

  if (
    teamBScore !== null &&
    teamBScore < 0
  ) {
    throw new Error(
      "Invalid away score.",
    );
  }

  const existingPlayoffs =
    await getTournamentPlayoffs(
      tournamentId,
    );

  const existing =
    existingPlayoffs.find(
      (playoff) =>
        playoff.stage === "final",
    );

  const playoff: PlayoffTie = {
    id:
      existing?.id ??
      crypto.randomUUID(),

    tournamentId,
    stage: "final",
    number: 1,

    teamAId,
    teamBId,

    leg1TeamAScore: teamAScore,
    leg1TeamBScore: teamBScore,

    leg2TeamAScore: null,
    leg2TeamBScore: null,

    createdAt:
      existing?.createdAt ??
      new Date().toISOString(),
  };

  await redis.set(
    playoffKey(playoff.id),
    playoff,
  );

  await redis.sadd(
    PLAYOFFS_KEY(tournamentId),
    playoff.id,
  );

  return playoff;
}