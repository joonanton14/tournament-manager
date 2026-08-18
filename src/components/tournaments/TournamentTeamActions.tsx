"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  removeTeamFromTournamentAction,
  updateTournamentTeamAction,
} from "@/app/tournaments/actions";
import type { Team } from "@/types";

type TournamentTeamActionsProps = {
  tournamentId: string;
  tournamentTeamId: string;
  currentTeamId: string;
  teams: Team[];
  existingTeamIds: string[];
};

export function TournamentTeamActions({
  tournamentId,
  tournamentTeamId,
  currentTeamId,
  teams,
  existingTeamIds,
}: TournamentTeamActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [selectedTeamId, setSelectedTeamId] =
    useState(currentTeamId);

  const availableTeams = teams.filter(
    (team) =>
      team.id === currentTeamId ||
      !existingTeamIds.includes(team.id),
  );

  function handleChangeTeam() {
    if (!selectedTeamId || selectedTeamId === currentTeamId) {
      setEditing(false);
      return;
    }

    const confirmed = window.confirm(
      "Changing the team will clear the current player assignments. Continue?",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();

    formData.set(
      "tournamentTeamId",
      tournamentTeamId,
    );

    formData.set("teamId", selectedTeamId);

    startTransition(async () => {
      const result =
        await updateTournamentTeamAction(formData);

      if (!result.success) {
        window.alert(
          result.error ?? "Failed to change team.",
        );
        return;
      }

      setEditing(false);
      router.refresh();
    });
  }

  function handleRemove() {
    const confirmed = window.confirm(
      "Remove this team from the tournament? The team itself will not be deleted.",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();

    formData.set(
      "tournamentTeamId",
      tournamentTeamId,
    );

    formData.set("tournamentId", tournamentId);

    startTransition(async () => {
      const result =
        await removeTeamFromTournamentAction(formData);

      if (!result.success) {
        window.alert(
          result.error ??
            "Failed to remove team from tournament.",
        );
        return;
      }

      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <label
          htmlFor={`change-team-${tournamentTeamId}`}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Change team
        </label>

        <select
          id={`change-team-${tournamentTeamId}`}
          value={selectedTeamId}
          onChange={(event) =>
            setSelectedTeamId(event.target.value)
          }
          disabled={isPending}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        >
          {availableTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleChangeTeam}
            disabled={isPending}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTeamId(currentTeamId);
              setEditing(false);
            }}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={isPending}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      >
        Change team
      </button>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}