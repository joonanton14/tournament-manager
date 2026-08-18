"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTournamentStandingsAction } from "@/app/tournaments/actions";
import type {
  Team,
  TournamentStanding,
  TournamentTeam,
} from "@/types";

type Row = {
  tournamentTeamId: string;
  teamName: string;
  position: string;
  played: string;
  wins: string;
  draws: string;
  losses: string;
  goalsFor: string;
  goalsAgainst: string;
  points: string;
};

type RegularSeasonTableProps = {
  tournamentId: string;
  tournamentTeams: Array<{
    tournamentTeam: TournamentTeam;
    team: Team;
  }>;
  standings: TournamentStanding[];
};

export function RegularSeasonTable({
  tournamentId,
  tournamentTeams,
  standings,
}: RegularSeasonTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState<Row[]>(() =>
    tournamentTeams.map(
      ({ tournamentTeam, team }, index) => {
        const existing = standings.find(
          (standing) =>
            standing.tournamentTeamId ===
            tournamentTeam.id,
        );

        return {
          tournamentTeamId: tournamentTeam.id,
          teamName: team.name,

          position: existing
            ? String(existing.position)
            : String(index + 1),

          played: existing
            ? String(existing.played)
            : "",

          wins: existing
            ? String(existing.wins)
            : "",

          draws: existing
            ? String(existing.draws)
            : "",

          losses: existing
            ? String(existing.losses)
            : "",

          goalsFor: existing
            ? String(existing.goalsFor)
            : "",

          goalsAgainst: existing
            ? String(existing.goalsAgainst)
            : "",

          points: existing
            ? String(existing.points)
            : "",
        };
      },
    ),
  );

  function updateRow(
    index: number,
    field: keyof Omit<
      Row,
      "tournamentTeamId" | "teamName"
    >,
    value: string,
  ) {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function handleSave() {
    const formData = new FormData();

    formData.set(
      "tournamentId",
      tournamentId,
    );

    formData.set(
      "rows",
      JSON.stringify(
        rows.map((row) => ({
          tournamentTeamId:
            row.tournamentTeamId,

          position:
            Number(row.position) || 0,

          played:
            Number(row.played) || 0,

          wins:
            Number(row.wins) || 0,

          draws:
            Number(row.draws) || 0,

          losses:
            Number(row.losses) || 0,

          goalsFor:
            Number(row.goalsFor) || 0,

          goalsAgainst:
            Number(row.goalsAgainst) || 0,

          points:
            Number(row.points) || 0,
        })),
      ),
    );

    startTransition(async () => {
      const result =
        await saveTournamentStandingsAction(
          formData,
        );

      if (!result.success) {
        window.alert(
          result.error ??
            "Failed to save standings.",
        );
        return;
      }

      router.refresh();
    });
  }

  if (!tournamentTeams.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="font-semibold text-slate-950">
          Add teams first
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Add the tournament teams before entering
          the regular-season table.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-4">
                Pos
              </th>

              <th className="px-4 py-4">
                Team
              </th>

              <th className="px-3 py-4 text-center">
                P
              </th>

              <th className="px-3 py-4 text-center">
                W
              </th>

              <th className="px-3 py-4 text-center">
                D
              </th>

              <th className="px-3 py-4 text-center">
                L
              </th>

              <th className="px-3 py-4 text-center">
                GF
              </th>

              <th className="px-3 py-4 text-center">
                GA
              </th>

              <th className="px-3 py-4 text-center">
                Pts
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.tournamentTeamId}
                className="border-b border-slate-100 last:border-0"
              >
                {/* Position */}
                <td className="px-4 py-4">
                  <input
                    type="number"
                    min="1"
                    value={row.position}
                    onChange={(event) =>
                      updateRow(
                        index,
                        "position",
                        event.target.value,
                      )
                    }
                    className="w-16 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </td>

                {/* Team */}
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-950">
                    {row.teamName}
                  </div>
                </td>

                {/* Other statistics */}
                {(
                  [
                    "played",
                    "wins",
                    "draws",
                    "losses",
                    "goalsFor",
                    "goalsAgainst",
                    "points",
                  ] as const
                ).map((field) => (
                  <td
                    key={field}
                    className="px-3 py-4"
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row[field]}
                      onChange={(event) =>
                        updateRow(
                          index,
                          field,
                          event.target.value,
                        )
                      }
                      className="mx-auto w-16 rounded-lg border border-slate-200 px-2 py-2 text-center text-sm outline-none placeholder:text-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Enter the final regular-season table manually.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : "Save table"}
        </button>
      </div>
    </div>
  );
}