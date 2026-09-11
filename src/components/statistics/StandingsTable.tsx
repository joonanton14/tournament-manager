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
          Sarjataulukko ei ole vielä julkaistu
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Tämän turnauksen sarjataulukko ei ole vielä julkaistu. Kun turnaus on käynnissä, sarjataulukko päivittyy automaattisesti.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse sm:min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
              <th className="px-2 py-3 sm:px-5 sm:py-4">
                PL
              </th>

              <th className="px-2 py-3 sm:px-5 sm:py-4">
                Joukkue
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                P
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                V
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                TP
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                H
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                TM
              </th>

              <th className="px-2 py-3 text-center sm:px-4 sm:py-4">
                PM
              </th>

              <th className="px-2 py-3 text-center sm:px-5 sm:py-4">
                Ps
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
                  <td className="px-2 py-3 sm:px-5 sm:py-5">
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black sm:h-9 sm:w-9 sm:text-sm",
                        standing.position === 1
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {standing.position}
                    </div>
                  </td>

                  <td className="px-2 py-3 sm:px-5 sm:py-5">
                    <span className="text-sm font-bold text-slate-950 sm:text-base">
                      {team.name}
                    </span>
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.played}
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.wins}
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.draws}
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.losses}
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.goalsFor}
                  </td>

                  <td className="px-2 py-3 text-center text-xs text-slate-600 sm:px-4 sm:py-5 sm:text-sm">
                    {standing.goalsAgainst}
                  </td>

                  <td className="px-2 py-3 text-center text-base font-black text-slate-950 sm:px-5 sm:py-5 sm:text-lg">
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