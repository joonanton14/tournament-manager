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

export function LiveScheduleForm({
  tournamentId,
  tournamentTeams,
}: LiveScheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamAId, setTeamAId] = useState(tournamentTeams[0]?.tournamentTeam.id ?? "");
  const [teamBId, setTeamBId] = useState(
    tournamentTeams[1]?.tournamentTeam.id ?? tournamentTeams[0]?.tournamentTeam.id ?? "",
  );
  const [teamAScore, setTeamAScore] = useState("");
  const [teamBScore, setTeamBScore] = useState("");
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
    formData.set("teamAScore", teamAScore);
    formData.set("teamBScore", teamBScore);
    formData.set("playedAt", new Date().toISOString());

    startTransition(async () => {
      const result = await saveTournamentMatchAction(formData);

      if (!result.success) {
        setError(result.error ?? "Pelin tallennus epäonnistui.");
        return;
      }

      setSuccess("Ottelu tallennettu.");
      setTeamAId(tournamentTeams[0]?.tournamentTeam.id ?? "");
      setTeamBId(
        tournamentTeams[1]?.tournamentTeam.id ?? tournamentTeams[0]?.tournamentTeam.id ?? "",
      );
      setTeamAScore("");
      setTeamBScore("");
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
            onChange={(event) => setTeamAId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            {tournamentTeams.map(({ team, tournamentTeam }) => (
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
            {tournamentTeams
              .filter(({ tournamentTeam }) => tournamentTeam.id !== teamAId)
              .map(({ team, tournamentTeam }) => (
                <option key={tournamentTeam.id} value={tournamentTeam.id}>{team.name}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Kotijoukkueen maali</label>
          <input
            type="number"
            min="0"
            value={teamAScore}
            onChange={(event) => setTeamAScore(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-violet-500/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Vierasjoukkueen maali</label>
          <input
            type="number"
            min="0"
            value={teamBScore}
            onChange={(event) => setTeamBScore(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-violet-500/10"
          />
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
