import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/Card";

import { AddTeamForm } from "@/components/tournaments/AddTeamForm";

import { PlayerAssignmentForm } from "@/components/tournaments/PlayerAssignmentForm";

import { TournamentTeamActions } from "@/components/tournaments/TournamentTeamActions";

import { TournamentTabs } from "@/components/tournaments/TournamentTabs";

import { updateTournamentAction } from "@/app/tournaments/actions";

import { getPlayers } from "@/lib/players";

import { isAdminAuthenticated } from "@/lib/auth";
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

function formatDateTime(
  value: string | null | undefined,
) {
  if (!value) {
    return "Ei määritetty";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Ei määritetty";
  }

  return new Intl.DateTimeFormat(
    "fi-FI",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "Europe/Helsinki",
    },
  ).format(date);
}

/*
 * datetime-local input expects:
 * YYYY-MM-DDTHH:mm
 *
 * Tournament dates are already stored
 * in this format, but this helper also
 * handles ISO strings safely.
 */
function formatDateTimeInput(
  value: string | null | undefined,
) {
  if (!value) {
    return "";
  }

  const match =
    value.match(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,
    );

  if (match) {
    return match[0];
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const parts =
    new Intl.DateTimeFormat(
      "sv-SE",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone:
          "Europe/Helsinki",
      },
    ).formatToParts(date);

  const values =
    Object.fromEntries(
      parts.map((part) => [
        part.type,
        part.value,
      ]),
    );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export default async function TournamentPage({
  params,
}: TournamentPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

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
      (item) =>
        item.team.id,
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

        <div className="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white">
          <div className="relative overflow-hidden p-8 sm:p-10">

            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-400">
                Turnaus #{tournament.number}
              </p>

              <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    {tournament.name}
                  </h1>

                  <div className="mt-4 space-y-1 text-sm text-slate-400">
                    <p>
                      Alkaa:{" "}
                      {formatDateTime(
                        tournament.startDate,
                      )}
                    </p>

                    <p>
                      Päättyy:{" "}
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

        {/* EDIT TOURNAMENT */}

        <section className="mt-8">
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-950">
                Muokkaa turnausta
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Voit muuttaa turnauksen nimeä sekä alkamis- ja päättymisaikaa.
              </p>
            </div>

            <form
              action={updateTournamentAction}
              className="space-y-6"
            >
              <input
                type="hidden"
                name="tournamentId"
                value={tournament.id}
              />

              <div className="grid gap-6 md:grid-cols-3">

                <div className="md:col-span-1">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Turnauksen nimi
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={
                      tournament.name
                    }
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Alkamisaika
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    defaultValue={formatDateTimeInput(
                      tournament.startDate,
                    )}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Päättymisaika
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    defaultValue={formatDateTimeInput(
                      tournament.endDate,
                    )}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

              </div>

              <div className="flex justify-end border-t border-slate-200 pt-5">
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  Tallenna muutokset
                </button>
              </div>
            </form>
          </Card>
        </section>

        {/* ADD TEAMS */}

        <section className="mt-8">
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-950">
                Lisää joukkueita turnaukseen
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Valitse jo luomistasi joukkueista.
              </p>
            </div>

            <AddTeamForm
              tournamentId={
                tournament.id
              }
              teams={teams}
              existingTeamIds={
                existingTeamIds
              }
            />
          </Card>
        </section>

        {/* TOURNAMENT TEAMS */}

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Turnauksen joukkueet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Määritä tässä turnauksessa pelaavat pelaajat jokaiselle joukkueelle.
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
                    key={
                      tournamentTeam.id
                    }
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
                                .playerIds
                                .length
                            }{" "}
                            {tournamentTeam
                              .playerIds
                              .length ===
                            1
                              ? "pelaaja"
                              : "pelaajaa"}
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
                        currentTeamId={
                          team.id
                        }
                        teams={teams}
                        existingTeamIds={
                          existingTeamIds
                        }
                      />

                    </div>

                    <div className="p-6">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Pelaajat
                      </p>

                      <PlayerAssignmentForm
                        tournamentTeamId={
                          tournamentTeam.id
                        }
                        players={
                          players
                        }
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
                Joukkueita ei ole vielä lisätty
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Lisää joukkueita yläpuolelta aloittaaksesi turnauksen rakentamisen.
              </p>

            </div>
          )}
        </section>

      </div>
    </div>
  );
}