"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
    createTeam,
    deleteTeam,
    updateTeam,
} from "@/lib/teams";

const teamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Team name is required.")
        .max(100, "Team name is too long."),
});

export async function addTeamAction(formData: FormData) {
    const result = teamSchema.safeParse({
        name: formData.get("name"),
    });

    if (!result.success) {
        return {
            success: false,
            error: result.error.issues[0]?.message ?? "Invalid team data.",
        };
    }

    try {
        await createTeam(result.data.name);

        revalidatePath("/teams");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to create team:", error);

        return {
            success: false,
            error: "Failed to create team.",
        };
    }
}

export async function updateTeamAction(
    id: string,
    formData: FormData,
) {
    const result = teamSchema.safeParse({
        name: formData.get("name"),
    });

    if (!result.success) {
        return {
            success: false,
            error:
                result.error.issues[0]?.message ??
                "Invalid team data.",
        };
    }

    try {
        await updateTeam(id, result.data.name);

        revalidatePath("/teams");
        revalidatePath(`/teams/${id}`);

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to update team:", error);

        return {
            success: false,
            error: "Failed to update team.",
        };
    }
}

export async function deleteTeamAction(id: string) {
    try {
        await deleteTeam(id);

        revalidatePath("/teams");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Failed to delete team:", error);

        return {
            success: false,
            error: "Failed to delete team.",
        };
    }
}