import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/Card";
import { LiveScheduleForm } from "@/components/tournaments/LiveScheduleForm";
import { RecentResultsList } from "@/components/tournaments/RecentResultsList";
import { RegularSeasonTable } from "@/components/tournaments/RegularSeasonTable";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";

import { isAdminAuthenticated } from "@/lib/auth";
import { getTournamentMatches } from "@/lib/matches";
import { getPlayers } from "@/lib/players";
import { getTournamentStandings } from "@/lib/standings";
import { getTeams } from "@/lib/teams";
import { getTournamentById, getTournamentTeamDetails } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

type RegularSeasonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RegularSeasonPage({
  params,
}: RegularSeasonPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [tournament, teams, players, standings, matches] =
    await Promise.all([
      getTournamentById(id),
      getTeams(),
      getPlayers(),
      getTournamentStandings(id),
      getTournamentMatches(id),
    ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails = await getTournamentTeamDetails(id, teams);

  const tournamentTeamLookup = new Map(
    tournamentTeamDetails.map(({ tournamentTeam, team }) => [tournamentTeam.id, team] as const),
  );
  const playerLookup = new Map(players.map((player) => [player.id, player] as const));
  const teamPlayerNames = Object.fromEntries(
    tournamentTeamDetails.map(({ tournamentTeam }) => [
      tournamentTeam.id,
      tournamentTeam.playerIds.flatMap((playerId) => {
        const player = playerLookup.get(playerId);
        return player
          ? [player.nickname || player.name]
          : [];
      }),
    ]),
  );

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/tournaments"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Takaisin turnauksiin
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Turnaus #{tournament.number}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {tournament.name}
          </h1>

          <p className="mt-3 text-slate-600">
            Lisää otteluita, seuraa pelattuja pelejä ja katso sarjataulukko
          </p>
        </div>

        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="regular-season"
        />

        {tournament.mode === "live" && tournamentTeamDetails.length >= 2 && (
          <section className="mt-8">
            <Card className="p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Lisää ottelu
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Lisää yksi ottelu kerrallaan. Sarjataulukko päivittyy automaattisesti jokaisen tuloksen jälkeen.
                </p>
              </div>

              <LiveScheduleForm
                tournamentId={tournament.id}
                tournamentTeams={tournamentTeamDetails}
              />
            </Card>

            {matches.length > 0 && (
              <div className="mt-6">
                <RecentResultsList
                  matches={matches}
                  teams={teams}
                  tournamentTeamLookup={tournamentTeamLookup}
                  teamPlayerNames={teamPlayerNames}
                />
              </div>
            )}
          </section>
        )}

        <section className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Sarjataulukko
              </h2>
            </div>

            <RegularSeasonTable
              tournamentId={tournament.id}
              isLiveTournament={tournament.mode === "live"}
              tournamentTeams={tournamentTeamDetails}
              standings={standings}
              teamPlayerNames={teamPlayerNames}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}