"use client";

import { useMemo, useState, useTransition } from "react";
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
  played: string;
  wins: string;
  draws: string;
  losses: string;
  goalsFor: string;
  goalsAgainst: string;
  points: string;
  previousPosition: number;
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

  const [isPending, startTransition] =
    useTransition();

  const [rows, setRows] = useState<Row[]>(() =>
    tournamentTeams.map(
      ({ tournamentTeam, team }, index) => {
        const existing = standings.find(
          (standing) =>
            standing.tournamentTeamId ===
            tournamentTeam.id,
        );

        return {
          tournamentTeamId:
            tournamentTeam.id,

          teamName: team.name,

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

          previousPosition:
            existing?.position ??
            index + 1,
        };
      },
    ),
  );

  /*
   * Display order is calculated from points.
   *
   * Higher points = higher position.
   *
   * If two teams have the same points, we keep
   * their previously saved position for now.
   */
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const pointsA =
        Number(a.points) || 0;

      const pointsB =
        Number(b.points) || 0;

      if (pointsA !== pointsB) {
        return pointsB - pointsA;
      }

      return (
        a.previousPosition -
        b.previousPosition
      );
    });
  }, [rows]);

  function updateRow(
    tournamentTeamId: string,
    field: keyof Omit<
      Row,
      "tournamentTeamId" |
        "teamName" |
        "previousPosition"
    >,
    value: string,
  ) {
    setRows((current) =>
      current.map((row) =>
        row.tournamentTeamId ===
        tournamentTeamId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  }

  function handleSave() {
    /*
     * The sorted order determines the final position.
     */
    const rowsToSave =
      sortedRows.map(
        (row, index) => ({
          tournamentTeamId:
            row.tournamentTeamId,

          position: index + 1,

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
        }),
      );

    const formData = new FormData();

    formData.set(
      "tournamentId",
      tournamentId,
    );

    formData.set(
      "rows",
      JSON.stringify(rowsToSave),
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
          Lisää joukkueet ensin
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Lisää turnausjoukkueet ennen kuin voit lisätä sääntöjen mukaan
          sijoituksia.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="w-20 px-4 py-4">
                Pelipaikka
              </th>

              <th className="px-4 py-4">
                Joukkue
              </th>

              <th className="px-3 py-4 text-center">
                P
              </th>

              <th className="px-3 py-4 text-center">
                V
              </th>

              <th className="px-3 py-4 text-center">
                TP
              </th>

              <th className="px-3 py-4 text-center">
                T
              </th>

              <th className="px-3 py-4 text-center">
                TM
              </th>

              <th className="px-3 py-4 text-center">
                PM
              </th>

              <th className="px-3 py-4 text-center">
                Pis
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.map(
              (row, index) => (
                <tr
                  key={row.tournamentTeamId}
                  className="border-b border-slate-100 last:border-0"
                >
                  {/* Position */}
                  <td className="px-4 py-4">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black",
                        index === 0
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {index + 1}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">
                      {row.teamName}
                    </div>
                  </td>

                  {/* Played */}
                  <NumberInput
                    value={row.played}
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "played",
                        value,
                      )
                    }
                  />

                  {/* Wins */}
                  <NumberInput
                    value={row.wins}
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "wins",
                        value,
                      )
                    }
                  />

                  {/* Draws */}
                  <NumberInput
                    value={row.draws}
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "draws",
                        value,
                      )
                    }
                  />

                  {/* Losses */}
                  <NumberInput
                    value={row.losses}
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "losses",
                        value,
                      )
                    }
                  />

                  {/* Goals For */}
                  <NumberInput
                    value={row.goalsFor}
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "goalsFor",
                        value,
                      )
                    }
                  />

                  {/* Goals Against */}
                  <NumberInput
                    value={
                      row.goalsAgainst
                    }
                    onChange={(value) =>
                      updateRow(
                        row.tournamentTeamId,
                        "goalsAgainst",
                        value,
                      )
                    }
                  />

                  {/* Points */}
                  <td className="px-3 py-4">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={row.points}
                      onChange={(event) =>
                        updateRow(
                          row.tournamentTeamId,
                          "points",
                          event.target.value,
                        )
                      }
                      className={[
                        "mx-auto block w-20 rounded-lg border px-2 py-2 text-center text-sm font-bold outline-none",
                        "border-violet-200 bg-violet-50",
                        "placeholder:text-violet-300",
                        "focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10",
                      ].join(" ")}
                    />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Lopullinen sarjataulukko
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            Joukkueet on automaattisesti järjestetty pisteiden mukaan. Jos kaksi joukkuetta on tasapisteissä, niiden aiempi sijoitus säilyy.
          </p>
        </div>

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

type NumberInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function NumberInput({
  value,
  onChange,
}: NumberInputProps) {
  return (
    <td className="px-3 py-4">
      <input
        type="number"
        min="0"
        placeholder="0"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mx-auto block w-16 rounded-lg border border-slate-200 px-2 py-2 text-center text-sm outline-none placeholder:text-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
      />
    </td>
  );
}