"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    addTeamAction,
    updateTeamAction,
} from "@/app/teams/actions";
import type { Team } from "@/types";

type TeamFormProps = {
    team?: Team;
    onSuccess?: () => void;
};

export function TeamForm({
    team,
    onSuccess,
}: TeamFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(team?.name ?? "");
    const [error, setError] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const formData = new FormData();
        formData.set("name", name);

        startTransition(async () => {
            let result;

            if (team) {
                result = await updateTeamAction(team.id, formData);
            } else {
                result = await addTeamAction(formData);
            }

            if (!result.success) {
                setError(result.error ?? "Something went wrong.");
                return;
            }

            if (team) {
                router.push("/teams");
                return;
            }

            setName("");
            router.refresh();
            onSuccess?.();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label
                    htmlFor="team-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Team name
                </label>

                <input
                    id="team-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Real Madrid"
                    required
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
                    : team
                        ? "Save changes"
                        : "Add team"}
            </button>
        </form>
    );
}