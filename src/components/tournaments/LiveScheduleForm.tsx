"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveTournamentMatchAction } from "@/app/tournaments/actions";

import type { Team, TournamentTeam } from "@/types";

type TournamentTeamDetail = {
  tournamentTeam: TournamentTeam;
  team: Team;
};

type LiveScheduleFormProps = {
  tournamentId: string;
  tournamentTeams: TournamentTeamDetail[];
};

const scoreOptions = Array.from({ length: 11 }, (_, score) => score);
const customScoreValue = "custom";

export function LiveScheduleForm({
  tournamentId,
  tournamentTeams,
}: LiveScheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sortedTournamentTeams = [...tournamentTeams].sort(
    (teamA, teamB) =>
      teamA.team.name.localeCompare(teamB.team.name, "fi") ||
      teamA.tournamentTeam.id.localeCompare(teamB.tournamentTeam.id),
  );
  const initialTeamAId = sortedTournamentTeams[0]?.tournamentTeam.id ?? "";
  const initialTeamBId = sortedTournamentTeams.find(
    ({ tournamentTeam }) => tournamentTeam.id !== initialTeamAId,
  )?.tournamentTeam.id ?? "";
  const [teamAId, setTeamAId] = useState(initialTeamAId);
  const [teamBId, setTeamBId] = useState(initialTeamBId);
  const [teamAScore, setTeamAScore] = useState("");
  const [teamBScore, setTeamBScore] = useState("");
  const [teamACustomScore, setTeamACustomScore] = useState("");
  const [teamBCustomScore, setTeamBCustomScore] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!teamAId || !teamBId || teamAId === teamBId) {
      setError("Valitse kaksi eri joukkuetta.");
      return;
    }

    const formData = new FormData();
    formData.set("tournamentId", tournamentId);
    formData.set("teamAId", teamAId);
    formData.set("teamBId", teamBId);
    formData.set("teamAScore", teamAScore === customScoreValue ? teamACustomScore : teamAScore);
    formData.set("teamBScore", teamBScore === customScoreValue ? teamBCustomScore : teamBScore);
    formData.set("playedAt", new Date().toISOString());

    startTransition(async () => {
      const result = await saveTournamentMatchAction(formData);

      if (!result.success) {
        setError(result.error ?? "Pelin tallennus epäonnistui.");
        return;
      }

      setSuccess("Ottelu tallennettu.");
      setTeamAId(initialTeamAId);
      setTeamBId(initialTeamBId);
      setTeamAScore("");
      setTeamBScore("");
      setTeamACustomScore("");
      setTeamBCustomScore("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Kotijoukkue</label>
          <select
            value={teamAId}
            onChange={(event) => {
              const nextTeamAId = event.target.value;
              setTeamAId(nextTeamAId);

              if (nextTeamAId === teamBId) {
                setTeamBId(
                  sortedTournamentTeams.find(
                    ({ tournamentTeam }) => tournamentTeam.id !== nextTeamAId,
                  )?.tournamentTeam.id ?? "",
                );
              }
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            {sortedTournamentTeams.map(({ team, tournamentTeam }) => (
              <option key={tournamentTeam.id} value={tournamentTeam.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Vierasjoukkue</label>
          <select
            value={teamBId}
            onChange={(event) => setTeamBId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            {sortedTournamentTeams
              .filter(({ tournamentTeam }) => tournamentTeam.id !== teamAId)
              .map(({ team, tournamentTeam }) => (
                <option key={tournamentTeam.id} value={tournamentTeam.id}>{team.name}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {tournamentTeams.find(({ tournamentTeam }) => tournamentTeam.id === teamAId)?.team.name ?? "Kotijoukkueen maalit"}
          </label>
          <select
            value={teamAScore}
            onChange={(event) => setTeamAScore(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">Valitse maalit</option>
            {scoreOptions.map((score) => (
              <option key={score} value={score}>{score}</option>
            ))}
            <option value={customScoreValue}>Yli 10</option>
          </select>
          {teamAScore === customScoreValue && (
            <input
              type="number"
              min="11"
              step="1"
              value={teamACustomScore}
              onChange={(event) => setTeamACustomScore(event.target.value)}
              placeholder="Syötä maalien määrä"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {tournamentTeams.find(({ tournamentTeam }) => tournamentTeam.id === teamBId)?.team.name ?? "Vierasjoukkueen maalit"}
          </label>
          <select
            value={teamBScore}
            onChange={(event) => setTeamBScore(event.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">Valitse maalit</option>
            {scoreOptions.map((score) => (
              <option key={score} value={score}>{score}</option>
            ))}
            <option value={customScoreValue}>Yli 10</option>
          </select>
          {teamBScore === customScoreValue && (
            <input
              type="number"
              min="11"
              step="1"
              value={teamBCustomScore}
              onChange={(event) => setTeamBCustomScore(event.target.value)}
              placeholder="Syötä maalien määrä"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Tallennetaan..." : "Tallenna ottelu"}
      </button>
    </form>
  );
}
