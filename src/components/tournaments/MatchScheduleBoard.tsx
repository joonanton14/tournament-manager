"use client";

import type { Team, TournamentMatch } from "@/types";

type MatchScheduleBoardProps = {
  schedule: Array<{ round: number; teamAId: string; teamBId: string }>;
  teams: Team[];
  matches: TournamentMatch[];
  tournamentTeamLookup?: Map<string, Team>;
};

export function MatchScheduleBoard({
  schedule,
  teams,
  matches,
  tournamentTeamLookup,
}: MatchScheduleBoardProps) {
  const teamLookup = tournamentTeamLookup ?? new Map(teams.map((team) => [team.id, team]));

  return (
    <div className="space-y-3">
      {schedule.map((fixture, index) => {
        const teamA = teamLookup.get(fixture.teamAId) ?? teams.find((team) => team.id === fixture.teamAId);
        const teamB = teamLookup.get(fixture.teamBId) ?? teams.find((team) => team.id === fixture.teamBId);

        const result = matches.find(
          (match) =>
            (match.teamAId === fixture.teamAId && match.teamBId === fixture.teamBId) ||
            (match.teamAId === fixture.teamBId && match.teamBId === fixture.teamAId),
        );

        const resultTeamA = result ? teamLookup.get(result.teamAId) ?? teams.find((team) => team.id === result.teamAId) : teamA;
        const resultTeamB = result ? teamLookup.get(result.teamBId) ?? teams.find((team) => team.id === result.teamBId) : teamB;

        return (
          <div
            key={`${fixture.teamAId}-${fixture.teamBId}-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                <span>{teamA?.name ?? "Joukkue A"}</span>
                <span className="text-slate-400">vs</span>
                <span>{teamB?.name ?? "Joukkue B"}</span>
              </div>

              {result ? (
                <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  <span>{resultTeamA?.name ?? "Joukkue A"}</span>
                  <span>{result.teamAScore}</span>
                  <span className="text-emerald-500">-</span>
                  <span>{result.teamBScore}</span>
                  <span>{resultTeamB?.name ?? "Joukkue B"}</span>
                </div>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                  Odottaa
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
