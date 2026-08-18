import type {
  Team,
  TournamentStanding,
  TournamentTeam,
} from "@/types";

type StandingsTableProps = {
  rows: Array<{
    standing: TournamentStanding;
    team: Team;
    tournamentTeam: TournamentTeam;
  }>;
};

export function StandingsTable({
  rows,
}: StandingsTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="font-semibold text-slate-950">
          No standings available
        </p>

        <p className="mt-2 text-sm text-slate-500">
          This tournament does not have a published
          regular-season table yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">
                Pos
              </th>

              <th className="px-5 py-4">
                Team
              </th>

              <th className="px-4 py-4 text-center">
                P
              </th>

              <th className="px-4 py-4 text-center">
                W
              </th>

              <th className="px-4 py-4 text-center">
                D
              </th>

              <th className="px-4 py-4 text-center">
                L
              </th>

              <th className="px-4 py-4 text-center">
                GF
              </th>

              <th className="px-4 py-4 text-center">
                GA
              </th>

              <th className="px-5 py-4 text-center">
                Pts
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map(
              ({
                standing,
                team,
              }) => (
                <tr
                  key={standing.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-5 py-5">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black",
                        standing.position === 1
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {standing.position}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="font-bold text-slate-950">
                      {team.name}
                    </span>
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.played}
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.wins}
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.draws}
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.losses}
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.goalsFor}
                  </td>

                  <td className="px-4 py-5 text-center text-sm text-slate-600">
                    {standing.goalsAgainst}
                  </td>

                  <td className="px-5 py-5 text-center text-lg font-black text-slate-950">
                    {standing.points}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}