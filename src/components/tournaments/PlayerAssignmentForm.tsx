"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignPlayersAction } from "@/app/tournaments/actions";
import type { Player } from "@/types";

type PlayerAssignmentFormProps = {
    tournamentTeamId: string;
    players: Player[];
    selectedPlayerIds: string[];
};

export function PlayerAssignmentForm({
    tournamentTeamId,
    players,
    selectedPlayerIds,
}: PlayerAssignmentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [selected, setSelected] =
        useState<string[]>(selectedPlayerIds);

    function togglePlayer(id: string) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((playerId) => playerId !== id)
                : [...current, id],
        );
    }

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const formData = new FormData();
        formData.set(
            "tournamentTeamId",
            tournamentTeamId,
        );

        selected.forEach((playerId) => {
            formData.append("playerIds", playerId);
        });

        startTransition(async () => {
            const result = await assignPlayersAction(formData);

            if (!result.success) {
                window.alert(
                    result.error ?? "Failed to assign players.",
                );
                return;
            }

            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {players.length ? (
                    players.map((player) => {
                        const checked = selected.includes(player.id);

                        return (
                            <label
                                key={player.id}
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition hover:bg-violet-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePlayer(player.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                />

                                <div className="min-w-0">
                                    <div className="font-semibold text-slate-900">
                                        {player.nickname || player.name}
                                    </div>

                                    {player.nickname && (
                                        <div className="text-xs text-slate-500">
                                            {player.name}
                                        </div>
                                    )}
                                </div>
                            </label>
                        );
                    })
                ) : (
                    <p className="p-4 text-sm text-slate-500">
                        Add players first.
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending || !players.length}
                className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isPending
                    ? "Saving..."
                    : `Save players (${selected.length})`}
            </button>
        </form>
    );
}