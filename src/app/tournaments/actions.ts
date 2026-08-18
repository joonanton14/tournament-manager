"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  saveSemiFinal,
} from "@/lib/playoffs";

import {
  addTeamToTournament,
  assignPlayersToTournamentTeam,
  createTournament,
  removeTeamFromTournament,
  updateTournamentTeam,
} from "@/lib/tournaments";

import { saveTournamentStandings } from "@/lib/standings";

/* -------------------------------------------------------
   Tournament
------------------------------------------------------- */

const tournamentSchema = z
  .object({
    number: z.coerce
      .number()
      .int()
      .min(1, "Tournament number must be at least 1."),

    name: z
      .string()
      .trim()
      .min(1, "Tournament name is required.")
      .max(100, "Tournament name is too long."),

    startDate: z
      .string()
      .min(1, "Start date is required."),

    endDate: z
      .string()
      .min(1, "End date is required."),
  })
  .refine(
    (data) => data.endDate >= data.startDate,
    {
      message:
        "End date cannot be before the start date.",
      path: ["endDate"],
    },
  );

export async function addTournamentAction(
  formData: FormData,
) {
  const result = tournamentSchema.safeParse({
    number: formData.get("number"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!result.success) {
    return {
      success: false,
      error:
        result.error.issues[0]?.message ??
        "Invalid tournament data.",
    };
  }

  try {
    const tournament = await createTournament(
      result.data.number,
      result.data.name,
      result.data.startDate,
      result.data.endDate,
    );

    revalidatePath("/tournaments");

    return {
      success: true,
      tournamentId: tournament.id,
    };
  } catch (error) {
    console.error(
      "Failed to create tournament:",
      error,
    );

    return {
      success: false,
      error: "Failed to create tournament.",
    };
  }
}

/* -------------------------------------------------------
   Add team to tournament
------------------------------------------------------- */

const addTeamSchema = z.object({
  tournamentId: z.string().min(1),
  teamId: z.string().min(1),
});

export async function addTeamToTournamentAction(
  formData: FormData,
) {
  const result = addTeamSchema.safeParse({
    tournamentId: formData.get("tournamentId"),
    teamId: formData.get("teamId"),
  });

  if (!result.success) {
    return {
      success: false,
      error: "Tournament and team are required.",
    };
  }

  try {
    await addTeamToTournament(
      result.data.tournamentId,
      result.data.teamId,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}`,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}/regular-season`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to add team to tournament:",
      error,
    );

    return {
      success: false,
      error: "Failed to add team to tournament.",
    };
  }
}

/* -------------------------------------------------------
   Assign players to tournament team
------------------------------------------------------- */

const assignmentSchema = z.object({
  tournamentTeamId: z.string().min(1),
  playerIds: z.array(z.string()),
});

export async function assignPlayersAction(
  formData: FormData,
) {
  const playerIds = formData
    .getAll("playerIds")
    .filter(
      (value): value is string =>
        typeof value === "string",
    );

  const result = assignmentSchema.safeParse({
    tournamentTeamId: formData.get(
      "tournamentTeamId",
    ),
    playerIds,
  });

  if (!result.success) {
    return {
      success: false,
      error: "Invalid player assignment.",
    };
  }

  try {
    await assignPlayersToTournamentTeam(
      result.data.tournamentTeamId,
      result.data.playerIds,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to assign players:",
      error,
    );

    return {
      success: false,
      error: "Failed to assign players.",
    };
  }
}

/* -------------------------------------------------------
   Change team inside tournament
------------------------------------------------------- */

const updateTournamentTeamSchema = z.object({
  tournamentTeamId: z.string().min(1),
  teamId: z.string().min(1),
});

export async function updateTournamentTeamAction(
  formData: FormData,
) {
  const result =
    updateTournamentTeamSchema.safeParse({
      tournamentTeamId: formData.get(
        "tournamentTeamId",
      ),
      teamId: formData.get("teamId"),
    });

  if (!result.success) {
    return {
      success: false,
      error:
        "Tournament team and new team are required.",
    };
  }

  try {
    const updated = await updateTournamentTeam(
      result.data.tournamentTeamId,
      result.data.teamId,
    );

    revalidatePath(
      `/tournaments/${updated.tournamentId}`,
    );

    revalidatePath(
      `/tournaments/${updated.tournamentId}/regular-season`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to update tournament team:",
      error,
    );

    return {
      success: false,
      error: "Failed to change team.",
    };
  }
}

/* -------------------------------------------------------
   Remove team from tournament
------------------------------------------------------- */

const removeTournamentTeamSchema = z.object({
  tournamentTeamId: z.string().min(1),
  tournamentId: z.string().min(1),
});

export async function removeTeamFromTournamentAction(
  formData: FormData,
) {
  const result =
    removeTournamentTeamSchema.safeParse({
      tournamentTeamId: formData.get(
        "tournamentTeamId",
      ),
      tournamentId: formData.get("tournamentId"),
    });

  if (!result.success) {
    return {
      success: false,
      error: "Invalid tournament team.",
    };
  }

  try {
    await removeTeamFromTournament(
      result.data.tournamentTeamId,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}`,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}/regular-season`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to remove team from tournament:",
      error,
    );

    return {
      success: false,
      error:
        "Failed to remove team from tournament.",
    };
  }
}

/* -------------------------------------------------------
   Save regular-season standings
------------------------------------------------------- */

const standingRowSchema = z.object({
  tournamentTeamId: z.string().min(1),

  position: z.coerce
    .number()
    .int()
    .min(1),

  played: z.coerce
    .number()
    .int()
    .min(0),

  wins: z.coerce
    .number()
    .int()
    .min(0),

  draws: z.coerce
    .number()
    .int()
    .min(0),

  losses: z.coerce
    .number()
    .int()
    .min(0),

  goalsFor: z.coerce
    .number()
    .int()
    .min(0),

  goalsAgainst: z.coerce
    .number()
    .int()
    .min(0),

  points: z.coerce
    .number()
    .int()
    .min(0),
});

const standingsSchema = z.object({
  tournamentId: z.string().min(1),
  rows: z.array(standingRowSchema),
});

export async function saveTournamentStandingsAction(
  formData: FormData,
) {
  const rawRows = formData.get("rows");

  let rows: unknown;

  try {
    rows = JSON.parse(
      typeof rawRows === "string"
        ? rawRows
        : "[]",
    );
  } catch {
    return {
      success: false,
      error: "Invalid standings data.",
    };
  }

  const result = standingsSchema.safeParse({
    tournamentId:
      formData.get("tournamentId"),
    rows,
  });

  if (!result.success) {
    console.error(
      "Invalid standings:",
      result.error,
    );

    return {
      success: false,
      error:
        result.error.issues[0]?.message ??
        "Invalid standings data.",
    };
  }

  try {
    await saveTournamentStandings(
      result.data.tournamentId,
      result.data.rows,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}/regular-season`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to save tournament standings:",
      error,
    );

    return {
      success: false,
      error: "Failed to save standings.",
    };
  }
}

const semiFinalSchema = z.object({
  tournamentId: z.string().min(1),

  number: z.coerce
    .number()
    .int()
    .min(1)
    .max(2),

  teamAId: z.string().min(1),
  teamBId: z.string().min(1),

  leg1TeamAScore: z.coerce
    .number()
    .int()
    .min(0)
    .nullable(),

  leg1TeamBScore: z.coerce
    .number()
    .int()
    .min(0)
    .nullable(),

  leg2TeamAScore: z.coerce
    .number()
    .int()
    .min(0)
    .nullable(),

  leg2TeamBScore: z.coerce
    .number()
    .int()
    .min(0)
    .nullable(),
});

function parseOptionalScore(
  value: FormDataEntryValue | null,
): number | null {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) && number >= 0
    ? number
    : null;
}

export async function saveSemiFinalAction(
  formData: FormData,
) {
  const result = semiFinalSchema.safeParse({
    tournamentId:
      formData.get("tournamentId"),

    number:
      formData.get("number"),

    teamAId:
      formData.get("teamAId"),

    teamBId:
      formData.get("teamBId"),

    leg1TeamAScore:
      parseOptionalScore(
        formData.get("leg1TeamAScore"),
      ),

    leg1TeamBScore:
      parseOptionalScore(
        formData.get("leg1TeamBScore"),
      ),

    leg2TeamAScore:
      parseOptionalScore(
        formData.get("leg2TeamAScore"),
      ),

    leg2TeamBScore:
      parseOptionalScore(
        formData.get("leg2TeamBScore"),
      ),
  });

  if (!result.success) {
    return {
      success: false,
      error:
        result.error.issues[0]?.message ??
        "Invalid semi-final data.",
    };
  }

  if (
    result.data.teamAId ===
    result.data.teamBId
  ) {
    return {
      success: false,
      error:
        "Semi-final teams must be different.",
    };
  }

  try {
    await saveSemiFinal(
      result.data.tournamentId,
      result.data.number,
      result.data.teamAId,
      result.data.teamBId,
      result.data.leg1TeamAScore,
      result.data.leg1TeamBScore,
      result.data.leg2TeamAScore,
      result.data.leg2TeamBScore,
    );

    revalidatePath(
      `/tournaments/${result.data.tournamentId}/playoffs`,
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Failed to save semi-final:",
      error,
    );

    return {
      success: false,
      error:
        "Failed to save semi-final.",
    };
  }
}