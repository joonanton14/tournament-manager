import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/Card";
import { AddTeamForm } from "@/components/tournaments/AddTeamForm";
import { PlayerAssignmentForm } from "@/components/tournaments/PlayerAssignmentForm";
import { TournamentTeamActions } from "@/components/tournaments/TournamentTeamActions";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";

import { getPlayers } from "@/lib/players";
import { getTeams } from "@/lib/teams";
import {
  getTournamentById,
  getTournamentTeamDetails,
} from "@/lib/tournaments";

export const dynamic = "force-dynamic";

type TournamentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    "fi-FI",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Helsinki",
    },
  ).format(new Date(value));
}

export default async function TournamentPage({
  params,
}: TournamentPageProps) {
  const { id } = await params;

  const [
    tournament,
    players,
    teams,
  ] = await Promise.all([
    getTournamentById(id),
    getPlayers(),
    getTeams(),
  ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails =
    await getTournamentTeamDetails(
      id,
      teams,
    );

  const existingTeamIds =
    tournamentTeamDetails.map(
      (item) => item.team.id,
    );

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/tournaments"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to tournaments
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white">
          <div className="relative overflow-hidden p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-400">
                Tournament #
                {tournament.number}
              </p>

              <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    {tournament.name}
                  </h1>

                  <div className="mt-4 space-y-1 text-sm text-slate-400">
                    <p>
                      Start:{" "}
                      {formatDateTime(
                        tournament.startDate,
                      )}
                    </p>

                    <p>
                      End:{" "}
                      {formatDateTime(
                        tournament.endDate,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-black shadow-xl shadow-violet-600/20">
                  {tournament.number}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="teams"
        />

        <section className="mt-8">
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                Add teams to this tournament
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose from the teams you already created.
              </p>
            </div>

            <AddTeamForm
              tournamentId={tournament.id}
              teams={teams}
              existingTeamIds={existingTeamIds}
            />
          </Card>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Tournament teams
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Assign the players participating with each
              team in this tournament.
            </p>
          </div>

          {tournamentTeamDetails.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {tournamentTeamDetails.map(
                ({
                  team,
                  tournamentTeam,
                }) => (
                  <Card
                    key={tournamentTeam.id}
                    className="overflow-hidden"
                  >
                    <div className="bg-violet-50 p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 font-black text-white">
                          {team.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-950">
                            {team.name}
                          </h3>

                          <p className="text-sm text-slate-500">
                            {
                              tournamentTeam
                                .playerIds.length
                            }{" "}
                            {tournamentTeam
                              .playerIds.length === 1
                              ? "player"
                              : "players"}
                          </p>
                        </div>
                      </div>

                      <TournamentTeamActions
                        tournamentId={
                          tournament.id
                        }
                        tournamentTeamId={
                          tournamentTeam.id
                        }
                        currentTeamId={team.id}
                        teams={teams}
                        existingTeamIds={
                          existingTeamIds
                        }
                      />
                    </div>

                    <div className="p-6">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Players
                      </p>

                      <PlayerAssignmentForm
                        tournamentTeamId={
                          tournamentTeam.id
                        }
                        players={players}
                        selectedPlayerIds={
                          tournamentTeam.playerIds
                        }
                      />
                    </div>
                  </Card>
                ),
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-semibold text-slate-950">
                No teams added yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Add some teams above to start building
                the tournament.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}