"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    addPlayerAction,
    updatePlayerAction,
} from "@/app/players/actions";
import type { Player } from "@/types";

type PlayerFormProps = {
    player?: Player;
    onSuccess?: () => void;
};

export function PlayerForm({
    player,
    onSuccess,
}: PlayerFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(player?.name ?? "");
    const [nickname, setNickname] = useState(player?.nickname ?? "");
    const [error, setError] = useState("");

    const isEditing = Boolean(player);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const formData = new FormData();
        formData.set("name", name);
        formData.set("nickname", nickname);

        startTransition(async () => {
            let result;

            if (player) {
                result = await updatePlayerAction(player.id, formData);
            } else {
                result = await addPlayerAction(formData);
            }

            if (!result.success) {
                setError(result.error ?? "Something went wrong.");
                return;
            }

            if (!isEditing) {
                setName("");
                setNickname("");
            }

            router.refresh();
            onSuccess?.();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Name
                </label>

                <input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Joona"
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
            </div>

            <div>
                <label
                    htmlFor="nickname"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Nickname
                    <span className="ml-2 font-normal text-slate-400">
                        Optional
                    </span>
                </label>

                <input
                    id="nickname"
                    name="nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="e.g. Jonde"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending
                    ? "Saving..."
                    : isEditing
                        ? "Save changes"
                        : "Add player"}
            </button>
        </form>
    );
}