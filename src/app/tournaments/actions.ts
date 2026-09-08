"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addTeamToTournament,
  assignPlayersToTournamentTeam,
  createTournament,
  removeTeamFromTournament,
  updateTournament,
  updateTournamentTeam,
} from "@/lib/tournaments";
import { saveTournamentStandings } from "@/lib/standings";
import { saveFinal, saveSemiFinal } from "@/lib/playoffs";

const tournamentSchema = z.object({
  number: z.coerce.number().int().min(1),
  name: z.string().trim().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be before the start date.",
  path: ["endDate"],
});

type ActionResult =
  | {
      success: true;
      error?: never;
      tournamentId?: string;
    }
  | {
      success: false;
      error: string;
      tournamentId?: never;
    };

function failure(
  error: unknown,
  fallback: string,
): ActionResult {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

export async function addTournamentAction(
  formData: FormData,
): Promise<ActionResult> {
  const result = tournamentSchema.safeParse({
    number: formData.get("number"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!result.success) return failure(result.error.issues[0]?.message, "Invalid tournament data.");

  try {
    const tournament = await createTournament(result.data.number, result.data.name, result.data.startDate, result.data.endDate);
    revalidatePath("/tournaments");
    return { success: true, tournamentId: tournament.id };
  } catch (error) {
    return failure(error, "Failed to create tournament.");
  }
}

const updateTournamentSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be before the start date.",
  path: ["endDate"],
});

export async function updateTournamentAction(
  formData: FormData,
): Promise<void> {
  const result = updateTournamentSchema.safeParse({
    tournamentId: formData.get("tournamentId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Invalid tournament data.");
  }

  await updateTournament(result.data.tournamentId, result.data.name, result.data.startDate, result.data.endDate);
  revalidateTournament(result.data.tournamentId);
}

const tournamentTeamSchema = z.object({
  tournamentId: z.string().min(1),
  teamId: z.string().min(1),
});

export async function addTeamToTournamentAction(
  formData: FormData,
): Promise<ActionResult> {
  const result = tournamentTeamSchema.safeParse({
    tournamentId: formData.get("tournamentId"),
    teamId: formData.get("teamId"),
  });
  if (!result.success) return failure("Tournament and team are required.", "Invalid tournament team.");

  try {
    await addTeamToTournament(result.data.tournamentId, result.data.teamId);
    revalidateTournament(result.data.tournamentId);
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to add team to tournament.");
  }
}

export async function assignPlayersAction(
  formData: FormData,
): Promise<ActionResult> {
  const tournamentTeamId = formData.get("tournamentTeamId");
  const playerIds = formData.getAll("playerIds").filter((value): value is string => typeof value === "string");
  if (typeof tournamentTeamId !== "string" || !tournamentTeamId) return failure("Invalid player assignment.", "Invalid player assignment.");

  try {
    await assignPlayersToTournamentTeam(tournamentTeamId, playerIds);
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to assign players.");
  }
}

export async function updateTournamentTeamAction(
  formData: FormData,
): Promise<ActionResult> {
  const teamId = formData.get("teamId");
  const tournamentTeamId = formData.get("tournamentTeamId");
  if (typeof tournamentTeamId !== "string" || typeof teamId !== "string" || !tournamentTeamId || !teamId) return failure("Tournament team and new team are required.", "Invalid tournament team.");

  try {
    const updated = await updateTournamentTeam(tournamentTeamId, teamId);
    revalidateTournament(updated.tournamentId);
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to change team.");
  }
}

export async function removeTeamFromTournamentAction(
  formData: FormData,
): Promise<ActionResult> {
  const tournamentTeamId = formData.get("tournamentTeamId");
  const tournamentId = formData.get("tournamentId");
  if (typeof tournamentTeamId !== "string" || typeof tournamentId !== "string" || !tournamentTeamId || !tournamentId) return failure("Invalid tournament team.", "Invalid tournament team.");

  try {
    await removeTeamFromTournament(tournamentTeamId);
    revalidateTournament(tournamentId);
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to remove team from tournament.");
  }
}

const standingRowSchema = z.object({
  tournamentTeamId: z.string().min(1),
  position: z.coerce.number().int().min(1),
  played: z.coerce.number().int().min(0),
  wins: z.coerce.number().int().min(0),
  draws: z.coerce.number().int().min(0),
  losses: z.coerce.number().int().min(0),
  goalsFor: z.coerce.number().int().min(0),
  goalsAgainst: z.coerce.number().int().min(0),
  points: z.coerce.number().int().min(0),
});

export async function saveTournamentStandingsAction(
  formData: FormData,
): Promise<ActionResult> {
  const tournamentId = formData.get("tournamentId");
  let rows: unknown;
  try {
    rows = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    return failure("Invalid standings data.", "Invalid standings data.");
  }
  const result = z.object({ tournamentId: z.string().min(1), rows: z.array(standingRowSchema) }).safeParse({ tournamentId, rows });
  if (!result.success) return failure(result.error.issues[0]?.message, "Invalid standings data.");

  try {
    await saveTournamentStandings(result.data.tournamentId, result.data.rows);
    revalidatePath(`/tournaments/${result.data.tournamentId}/regular-season`);
    revalidatePath(`/tournaments/${result.data.tournamentId}/playoffs`);
    revalidatePath("/statistics");
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to save standings.");
  }
}

function score(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export async function saveSemiFinalAction(
  formData: FormData,
): Promise<ActionResult> {
  const tournamentId = formData.get("tournamentId");
  const number = Number(formData.get("number"));
  const teamAId = formData.get("teamAId");
  const teamBId = formData.get("teamBId");
  if (typeof tournamentId !== "string" || typeof teamAId !== "string" || typeof teamBId !== "string" || !tournamentId || !teamAId || !teamBId || ![1, 2].includes(number)) return failure("Invalid semi-final data.", "Invalid semi-final data.");
  if (teamAId === teamBId) return failure("Semi-final teams must be different.", "Invalid semi-final data.");

  try {
    await saveSemiFinal(tournamentId, number, teamAId, teamBId, score(formData.get("leg1TeamAScore")), score(formData.get("leg1TeamBScore")), score(formData.get("leg2TeamAScore")), score(formData.get("leg2TeamBScore")));
    revalidatePath(`/tournaments/${tournamentId}/playoffs`);
    revalidatePath("/statistics");
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to save semi-final.");
  }
}

export async function saveFinalAction(
  formData: FormData,
): Promise<ActionResult> {
  const tournamentId = formData.get("tournamentId");
  const teamAId = formData.get("teamAId");
  const teamBId = formData.get("teamBId");
  const teamAScore = score(formData.get("teamAScore"));
  const teamBScore = score(formData.get("teamBScore"));
  if (typeof tournamentId !== "string" || typeof teamAId !== "string" || typeof teamBId !== "string" || !tournamentId || !teamAId || !teamBId || teamAScore === null || teamBScore === null) return failure("Invalid final data.", "Invalid final data.");
  if (teamAId === teamBId) return failure("Finalists must be different.", "Invalid final data.");

  try {
    await saveFinal(tournamentId, teamAId, teamBId, teamAScore, teamBScore);
    revalidatePath(`/tournaments/${tournamentId}/playoffs`);
    revalidatePath("/statistics");
    return { success: true };
  } catch (error) {
    return failure(error, "Failed to save final.");
  }
}

function revalidateTournament(tournamentId: string) {
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}/regular-season`);
  revalidatePath(`/tournaments/${tournamentId}/playoffs`);
}
