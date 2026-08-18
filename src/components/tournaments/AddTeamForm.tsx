"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTeamToTournamentAction } from "@/app/tournaments/actions";
import type { Team } from "@/types";

type AddTeamFormProps = {
  tournamentId: string;
  teams: Team[];
  existingTeamIds: string[];
};

export function AddTeamForm({
  tournamentId,
  teams,
  existingTeamIds,
}: AddTeamFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamId, setTeamId] = useState("");

  const availableTeams = teams.filter(
    (team) => !existingTeamIds.includes(team.id),
  );

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!teamId) {
      return;
    }

    const formData = new FormData();
    formData.set("tournamentId", tournamentId);
    formData.set("teamId", teamId);

    startTransition(async () => {
      const result =
        await addTeamToTournamentAction(formData);

      if (!result.success) {
        window.alert(
          result.error ?? "Failed to add team.",
        );
        return;
      }

      setTeamId("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <select
        value={teamId}
        onChange={(event) => setTeamId(event.target.value)}
        disabled={!availableTeams.length || isPending}
        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
      >
        <option value="">
          {availableTeams.length
            ? "Select a team..."
            : "All teams added"}
        </option>

        {availableTeams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={!teamId || isPending}
        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add team"}
      </button>
    </form>
  );
}