"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createPlayer,
  deletePlayer,
  updatePlayer,
} from "@/lib/players";

const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Player name is required.")
    .max(100, "Player name is too long."),
  nickname: z
    .string()
    .trim()
    .max(100, "Nickname is too long.")
    .optional(),
});

export async function addPlayerAction(formData: FormData) {
  const result = playerSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid player data.",
    };
  }

  try {
    await createPlayer(result.data.name, result.data.nickname);

    revalidatePath("/players");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to create player:", error);

    return {
      success: false,
      error: "Failed to create player.",
    };
  }
}

export async function updatePlayerAction(
  id: string,
  formData: FormData,
) {
  const result = playerSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
  });

  if (!result.success) {
    return {
      success: false,
      error:
        result.error.issues[0]?.message ??
        "Invalid player data.",
    };
  }

  try {
    await updatePlayer(
      id,
      result.data.name,
      result.data.nickname,
    );

    revalidatePath("/players");
    revalidatePath(`/players/${id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update player:", error);

    return {
      success: false,
      error: "Failed to update player.",
    };
  }
}

export async function deletePlayerAction(id: string) {
  try {
    await deletePlayer(id);

    revalidatePath("/players");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete player:", error);

    return {
      success: false,
      error: "Failed to delete player.",
    };
  }
}