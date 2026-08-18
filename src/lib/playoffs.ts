import { redis } from "@/lib/redis";
import type { PlayoffTie } from "@/types";

const PLAYOFFS_KEY = (tournamentId: string) =>
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
    .sort((a, b) => a.number - b.number);
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
  if (teamAId === teamBId) {
    throw new Error(
      "Semi-final teams must be different.",
    );
  }

  if (!teamAId || !teamBId) {
    throw new Error(
      "Both semi-final teams are required.",
    );
  }

  if (
    leg1TeamAScore !== null &&
    leg1TeamAScore < 0
  ) {
    throw new Error("Invalid leg 1 score.");
  }

  if (
    leg1TeamBScore !== null &&
    leg1TeamBScore < 0
  ) {
    throw new Error("Invalid leg 1 score.");
  }

  if (
    leg2TeamAScore !== null &&
    leg2TeamAScore < 0
  ) {
    throw new Error("Invalid leg 2 score.");
  }

  if (
    leg2TeamBScore !== null &&
    leg2TeamBScore < 0
  ) {
    throw new Error("Invalid leg 2 score.");
  }

  const existingPlayoffs =
    await getTournamentPlayoffs(tournamentId);

  const existing = existingPlayoffs.find(
    (playoff) =>
      playoff.stage === "semi_final" &&
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