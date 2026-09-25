"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTournamentMatchAction } from "@/app/tournaments/actions";

import type { Team, TournamentMatch } from "@/types";

type RecentResultsListProps = {
  matches: TournamentMatch[];
  teams: Team[];
  tournamentTeamLookup?: Map<string, Team>;
};

export function RecentResultsList({
  matches,
  teams,
  tournamentTeamLookup,
}: RecentResultsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { teamAScore: string; teamBScore: string }>>({});
  const [error, setError] = useState<string | null>(null);

  const teamLookup = tournamentTeamLookup ?? new Map(teams.map((team) => [team.id, team]));
  const recentMatches = matches.slice().reverse().slice(0, 6);

  function handleEditOpen(match: TournamentMatch) {
    setEditingId(match.id);
    setDrafts((current) => ({
      ...current,
      [match.id]: {
        teamAScore: String(match.teamAScore),
        teamBScore: String(match.teamBScore),
      },
    }));
    setError(null);
  }

  function handleSave(match: TournamentMatch) {
    const draft = drafts[match.id] ?? {
      teamAScore: String(match.teamAScore),
      teamBScore: String(match.teamBScore),
    };

    const teamAScore = Number(draft.teamAScore);
    const teamBScore = Number(draft.teamBScore);

    if (!Number.isInteger(teamAScore) || !Number.isInteger(teamBScore) || teamAScore < 0 || teamBScore < 0) {
      setError("Maalit tulee olla kokonaislukuja.");
      return;
    }

    const formData = new FormData();
    formData.set("matchId", match.id);
    formData.set("tournamentId", match.tournamentId);
    formData.set("teamAScore", String(teamAScore));
    formData.set("teamBScore", String(teamBScore));

    startTransition(async () => {
      const result = await updateTournamentMatchAction(formData);

      if (!result.success) {
        setError(result.error ?? "Pelin päivitys epäonnistui.");
        return;
      }

      setEditingId(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-950">
          Pelatut ottelut
        </h3>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {recentMatches.map((match) => {
          const teamA = teamLookup.get(match.teamAId) ?? teams.find((team) => team.id === match.teamAId);
          const teamB = teamLookup.get(match.teamBId) ?? teams.find((team) => team.id === match.teamBId);
          const editing = editingId === match.id;

          return (
            <div
              key={match.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                  <span className="font-semibold text-slate-950">{teamA?.name ?? "Joukkue A"}</span>
                  <span>{match.teamAScore}</span>
                  <span className="text-slate-400">:</span>
                  <span>{match.teamBScore}</span>
                  <span className="font-semibold text-slate-950">{teamB?.name ?? "Joukkue B"}</span>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {new Date(match.playedAt).toLocaleString("fi-FI", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>

                  {!editing && (
                    <button
                      type="button"
                      onClick={() => handleEditOpen(match)}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Muokkaa
                    </button>
                  )}
                </div>
              </div>

              {editing && (
                <div className="mt-3 rounded-xl border border-violet-200 bg-white p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm text-slate-700">
                      <span className="mb-1 block font-semibold">{teamA?.name ?? "Joukkue A"}</span>
                      <input
                        type="number"
                        min="0"
                        value={drafts[match.id]?.teamAScore ?? String(match.teamAScore)}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [match.id]: {
                              teamAScore: event.target.value,
                              teamBScore: current[match.id]?.teamBScore ?? String(match.teamBScore),
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                      />
                    </label>

                    <label className="text-sm text-slate-700">
                      <span className="mb-1 block font-semibold">{teamB?.name ?? "Joukkue B"}</span>
                      <input
                        type="number"
                        min="0"
                        value={drafts[match.id]?.teamBScore ?? String(match.teamBScore)}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [match.id]: {
                              teamAScore: current[match.id]?.teamAScore ?? String(match.teamAScore),
                              teamBScore: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Peruuta
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSave(match)}
                      className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "Tallennetaan..." : "Tallenna"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
