"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteTournamentMatchAction, updateTournamentMatchAction } from "@/app/tournaments/actions";
import { TeamRosterName } from "@/components/TeamRosterName";

import type { Team, TournamentMatch } from "@/types";

type RecentResultsListProps = {
  matches: TournamentMatch[];
  teams: Team[];
  tournamentTeamLookup?: Map<string, Team>;
  teamPlayerNames: Record<string, string[]>;
  showAllByDefault?: boolean;
};

export function RecentResultsList({
  matches,
  teams,
  tournamentTeamLookup,
  teamPlayerNames,
  showAllByDefault = false,
}: RecentResultsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAllMatches, setShowAllMatches] = useState(showAllByDefault);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { teamAScore: string; teamBScore: string }>>({});
  const [error, setError] = useState<string | null>(null);

  const teamLookup = tournamentTeamLookup ?? new Map(teams.map((team) => [team.id, team]));
  const teamOptions = Array.from(
    new Set(matches.flatMap((match) => [match.teamAId, match.teamBId])),
  )
    .map((teamId) => ({
      id: teamId,
      name: teamLookup.get(teamId)?.name ?? teams.find((team) => team.id === teamId)?.name ?? "Joukkue",
    }))
    .sort((teamA, teamB) => teamA.name.localeCompare(teamB.name, "fi") || teamA.id.localeCompare(teamB.id));
  const activeTeamId = teamOptions.some((team) => team.id === selectedTeamId) ? selectedTeamId : "";
  const filteredMatches = matches
    .slice()
    .reverse()
    .filter((match) => !activeTeamId || match.teamAId === activeTeamId || match.teamBId === activeTeamId);
  const displayedMatches = showAllMatches ? filteredMatches : filteredMatches.slice(0, 6);

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

  function handleDelete(match: TournamentMatch) {
    if (!window.confirm("Haluatko varmasti poistaa tämän ottelun?")) {
      return;
    }

    const formData = new FormData();
    formData.set("matchId", match.id);
    formData.set("tournamentId", match.tournamentId);

    startTransition(async () => {
      const result = await deleteTournamentMatchAction(formData);

      if (!result.success) {
        setError(result.error ?? "Ottelun poistaminen epäonnistui.");
        return;
      }

      setEditingId(null);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-slate-950">
          Pelatut ottelut
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Joukkue
            <select
              value={activeTeamId}
              onChange={(event) => {
                setSelectedTeamId(event.target.value);
                setShowAllMatches(showAllByDefault);
              }}
              className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            >
              <option value="">Kaikki joukkueet</option>
              {teamOptions.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </label>
          {filteredMatches.length > 6 && (
            <button
              type="button"
              aria-expanded={showAllMatches}
              aria-controls="played-matches-list"
              onClick={() => setShowAllMatches((current) => !current)}
              className="text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              {showAllMatches ? "Näytä viimeisimmät" : "Näytä kaikki ottelut"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div id="played-matches-list" className="space-y-3">
        {!displayedMatches.length ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Ei vielä tallennettuja otteluita.
          </p>
        ) : displayedMatches.map((match) => {
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
                  <TeamRosterName
                    teamName={teamA?.name ?? "Joukkue A"}
                    playerNames={teamPlayerNames[match.teamAId] ?? []}
                    className="font-semibold text-slate-950"
                  />
                  <span>{match.teamAScore}</span>
                  <span className="text-slate-400">:</span>
                  <span>{match.teamBScore}</span>
                  <TeamRosterName
                    teamName={teamB?.name ?? "Joukkue B"}
                    playerNames={teamPlayerNames[match.teamBId] ?? []}
                    className="font-semibold text-slate-950"
                  />
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {new Date(match.playedAt).toLocaleString("fi-FI", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>

                  {!editing && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditOpen(match)}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                      >
                        Muokkaa
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(match)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Poista
                      </button>
                    </div>
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
