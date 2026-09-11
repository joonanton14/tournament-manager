import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { Card } from "@/components/Card";

import { TournamentTabs } from "@/components/tournaments/TournamentTabs";

import { SemiFinalForm } from "@/components/tournaments/SemiFinalForm";

import { FinalForm } from "@/components/tournaments/FinalForm";

import { isAdminAuthenticated } from "@/lib/auth";
import { getTeams } from "@/lib/teams";

import {
  getTournamentById,
  getTournamentTeamDetails,
} from "@/lib/tournaments";

import { getTournamentPlayoffs } from "@/lib/playoffs";

import { getTournamentStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

type PlayoffsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getSemiFinalWinnerTeamId(
  playoff:
    | Awaited<
        ReturnType<typeof getTournamentPlayoffs>
      >[number]
    | undefined,
) {
  if (!playoff) {
    return null;
  }

  const {
    teamAId,
    teamBId,
    leg1TeamAScore,
    leg1TeamBScore,
    leg2TeamAScore,
    leg2TeamBScore,
  } = playoff;

  if (
    leg1TeamAScore === null ||
    leg1TeamBScore === null ||
    leg2TeamAScore === null ||
    leg2TeamBScore === null
  ) {
    return null;
  }

  const teamAScore =
    leg1TeamAScore +
    leg2TeamAScore;

  const teamBScore =
    leg1TeamBScore +
    leg2TeamBScore;

  if (teamAScore > teamBScore) {
    return teamAId;
  }

  if (teamBScore > teamAScore) {
    return teamBId;
  }

  return null;
}

export default async function PlayoffsPage({
  params,
}: PlayoffsPageProps) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [
    tournament,
    teams,
    playoffs,
    standings,
  ] = await Promise.all([
    getTournamentById(id),
    getTeams(),
    getTournamentPlayoffs(id),
    getTournamentStandings(id),
  ]);

  if (!tournament) {
    notFound();
  }

  const tournamentTeamDetails =
    await getTournamentTeamDetails(
      id,
      teams,
    );

  const teamsWithStandings =
    tournamentTeamDetails
      .map(
        ({
          tournamentTeam,
          team,
        }) => ({
          tournamentTeam,
          team,
          standing:
            standings.find(
              (standing) =>
                standing.tournamentTeamId ===
                tournamentTeam.id,
            ),
        }),
      )
      .filter(
        (item) =>
          item.standing !== undefined,
      )
      .sort(
        (a, b) =>
          (a.standing?.position ?? 999) -
          (b.standing?.position ?? 999),
      );

  const teamCount =
    tournamentTeamDetails.length;

  const isFourTeamFormat =
    teamCount === 4;

  const isFivePlusTeamFormat =
    teamCount >= 5;

  const firstPlace =
    teamsWithStandings.find(
      (item) =>
        item.standing?.position === 1,
    );

  const secondPlace =
    teamsWithStandings.find(
      (item) =>
        item.standing?.position === 2,
    );

  const thirdPlace =
    teamsWithStandings.find(
      (item) =>
        item.standing?.position === 3,
    );

  const fourthPlace =
    teamsWithStandings.find(
      (item) =>
        item.standing?.position === 4,
    );

  const fifthPlace =
    teamsWithStandings.find(
      (item) =>
        item.standing?.position === 5,
    );

  const semiFinal1 =
    playoffs.find(
      (playoff) =>
        playoff.stage === "semi_final" &&
        playoff.number === 1,
    );

  const semiFinal2 =
    playoffs.find(
      (playoff) =>
        playoff.stage === "semi_final" &&
        playoff.number === 2,
    );

  const final =
    playoffs.find(
      (playoff) =>
        playoff.stage === "final",
    );

  /*
   * For four teams:
   *
   * 1st -> final
   * 2nd vs 3rd -> semifinal
   * 4th -> eliminated
   */

  const fourTeamSemiFinal =
    semiFinal1 &&
    secondPlace &&
    thirdPlace &&
    (
      (
        semiFinal1.teamAId ===
          secondPlace.team.id &&
        semiFinal1.teamBId ===
          thirdPlace.team.id
      ) ||
      (
        semiFinal1.teamAId ===
          thirdPlace.team.id &&
        semiFinal1.teamBId ===
          secondPlace.team.id
      )
    )
      ? semiFinal1
      : undefined;

  /*
   * For five teams:
   *
   * 1st vs 4th -> semifinal 1
   * 2nd vs 3rd -> semifinal 2
   * 5th -> eliminated
   */

  const fiveTeamSemiFinal1 =
    isFivePlusTeamFormat &&
    firstPlace &&
    fourthPlace
      ? semiFinal1 &&
        (
          (
            semiFinal1.teamAId ===
              firstPlace.team.id &&
            semiFinal1.teamBId ===
              fourthPlace.team.id
          ) ||
          (
            semiFinal1.teamAId ===
              fourthPlace.team.id &&
            semiFinal1.teamBId ===
              firstPlace.team.id
          )
        )
        ? semiFinal1
        : undefined
      : undefined;

  const fiveTeamSemiFinal2 =
    isFivePlusTeamFormat &&
    secondPlace &&
    thirdPlace
      ? semiFinal2 &&
        (
          (
            semiFinal2.teamAId ===
              secondPlace.team.id &&
            semiFinal2.teamBId ===
              thirdPlace.team.id
          ) ||
          (
            semiFinal2.teamAId ===
              thirdPlace.team.id &&
            semiFinal2.teamBId ===
              secondPlace.team.id
          )
        )
        ? semiFinal2
        : undefined
      : undefined;

  const allTeams =
    tournamentTeamDetails.map(
      ({ team }) => team,
    );

  /*
   * Calculate semifinal winners.
   */

  const fourTeamSemiFinalWinnerId =
    getSemiFinalWinnerTeamId(
      fourTeamSemiFinal,
    );

  const fiveTeamSemiFinal1WinnerId =
    getSemiFinalWinnerTeamId(
      fiveTeamSemiFinal1,
    );

  const fiveTeamSemiFinal2WinnerId =
    getSemiFinalWinnerTeamId(
      fiveTeamSemiFinal2,
    );

  const fourTeamSemiFinalWinner =
    fourTeamSemiFinalWinnerId
      ? allTeams.find(
          (team) =>
            team.id ===
            fourTeamSemiFinalWinnerId,
        )
      : undefined;

  const fiveTeamSemiFinal1Winner =
    fiveTeamSemiFinal1WinnerId
      ? allTeams.find(
          (team) =>
            team.id ===
            fiveTeamSemiFinal1WinnerId,
        )
      : undefined;

  const fiveTeamSemiFinal2Winner =
    fiveTeamSemiFinal2WinnerId
      ? allTeams.find(
          (team) =>
            team.id ===
            fiveTeamSemiFinal2WinnerId,
        )
      : undefined;

  /*
   * Determine finalists.
   */

  let finalTeamA =
    firstPlace?.team;

  let finalTeamB:
    | (typeof allTeams)[number]
    | undefined;

  if (isFourTeamFormat) {
    finalTeamB =
      fourTeamSemiFinalWinner;
  }

  if (isFivePlusTeamFormat) {
    /*
     * Five-team format:
     *
     * semifinal 1 = 1st vs 4th
     * semifinal 2 = 2nd vs 3rd
     *
     * The final is played between
     * the two semifinal winners.
     */

    finalTeamA =
      fiveTeamSemiFinal1Winner;

    finalTeamB =
      fiveTeamSemiFinal2Winner;
  }

  /*
   * Calculate final winner.
   */

  let finalWinner:
    | (typeof allTeams)[number]
    | undefined;

  let finalTie = false;

  if (
    final &&
    finalTeamA &&
    finalTeamB &&
    final.leg1TeamAScore !== null &&
    final.leg1TeamAScore !== undefined &&
    final.leg1TeamBScore !== null &&
    final.leg1TeamBScore !== undefined
  ) {
    if (
      final.leg1TeamAScore >
      final.leg1TeamBScore
    ) {
      finalWinner = finalTeamA;
    } else if (
      final.leg1TeamBScore >
      final.leg1TeamAScore
    ) {
      finalWinner = finalTeamB;
    } else {
      finalTie = true;
    }
  }

  const fourTeamStandingsReady =
    isFourTeamFormat &&
    teamsWithStandings.length === 4;

  const fiveTeamStandingsReady =
    isFivePlusTeamFormat &&
    teamsWithStandings.length >= 5;

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

          <p className="mt-3 max-w-2xl text-slate-600">
            Hallinnoi pudotuspelien tuloksia ja määritä turnauksen mestari.
          </p>
        </div>

        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="playoffs"
        />

        {!standings.length ? (
          <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-amber-900">
              Runkosarjan tulokset puuttuvat
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Syötä lopullinen runkosarjan taulukko ennen pudotuspelien määrittämistä.
            </p>

            <Link
              href={`/tournaments/${tournament.id}/regular-season`}
              className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Syötä runkosarjan taulukko
            </Link>
          </Card>
        ) : isFourTeamFormat ? (
          <>
            {!fourTeamStandingsReady && (
              <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
                <p className="font-semibold text-amber-900">
                  Tallenna ensin kaikkien neljän joukkueen sijoitukset.
                </p>

                <Link
                  href={`/tournaments/${tournament.id}/regular-season`}
                  className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Muokkaa sarjataulukkoa
                </Link>
              </Card>
            )}

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
                    Neljän joukkueen formaatti
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Pudotuspelipaikat
                  </h2>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <QualificationCard
                    position="1."
                    teamName={
                      firstPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Suoraan finaaliin"
                    highlight
                  />

                  <QualificationCard
                    position="2."
                    teamName={
                      secondPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä"
                  />

                  <QualificationCard
                    position="3."
                    teamName={
                      thirdPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä"
                  />

                  <QualificationCard
                    position="4."
                    teamName={
                      fourthPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Putoaa"
                    muted
                  />
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Välierä
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    2. sijoittunut vs 3. sijoittunut
                  </h2>
                </div>

                <div className="p-6">
                  {secondPlace &&
                  thirdPlace ? (
                    <SemiFinalForm
                      tournamentId={tournament.id}
                      number={1}
                      teams={allTeams}
                      existing={
                        fourTeamSemiFinal
                      }
                      initialTeamAId={
                        secondPlace.team.id
                      }
                      initialTeamBId={
                        thirdPlace.team.id
                      }
                      lockedTeams
                    />
                  ) : null}
                </div>
              </Card>
            </section>

            <FinalSection
              tournamentId={tournament.id}
              final={final}
              teamA={finalTeamA}
              teamB={finalTeamB}
              finalWinner={finalWinner}
              finalTie={finalTie}
              title="Finaali"
            />
          </>
        ) : isFivePlusTeamFormat ? (
          <>
            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
                    Viiden joukkueen formaatti
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Pudotuspelipaikat
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Runkosarjan sijoitus määrittää välieräparit.
                  </p>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <QualificationCard
                    position="1."
                    teamName={
                      firstPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä 1"
                    highlight
                  />

                  <QualificationCard
                    position="4."
                    teamName={
                      fourthPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä 1"
                  />

                  <QualificationCard
                    position="2."
                    teamName={
                      secondPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä 2"
                  />

                  <QualificationCard
                    position="3."
                    teamName={
                      thirdPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Välierä 2"
                  />

                  <QualificationCard
                    position="5."
                    teamName={
                      fifthPlace?.team.name ??
                      "Odottaa"
                    }
                    description="Putoaa"
                    muted
                  />
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Välierä 1
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    1. sijoittunut vs 4. sijoittunut
                  </h2>
                </div>

                <div className="p-6">
                  {firstPlace &&
                  fourthPlace ? (
                    <SemiFinalForm
                      tournamentId={tournament.id}
                      number={1}
                      teams={allTeams}
                      existing={
                        fiveTeamSemiFinal1
                      }
                      initialTeamAId={
                        firstPlace.team.id
                      }
                      initialTeamBId={
                        fourthPlace.team.id
                      }
                      lockedTeams
                    />
                  ) : null}
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Välierä 2
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    2. sijoittunut vs 3. sijoittunut
                  </h2>
                </div>

                <div className="p-6">
                  {secondPlace &&
                  thirdPlace ? (
                    <SemiFinalForm
                      tournamentId={tournament.id}
                      number={2}
                      teams={allTeams}
                      existing={
                        fiveTeamSemiFinal2
                      }
                      initialTeamAId={
                        secondPlace.team.id
                      }
                      initialTeamBId={
                        thirdPlace.team.id
                      }
                      lockedTeams
                    />
                  ) : null}
                </div>
              </Card>
            </section>

            <FinalSection
              tournamentId={tournament.id}
              final={final}
              teamA={finalTeamA}
              teamB={finalTeamB}
              finalWinner={finalWinner}
              finalTie={finalTie}
              title="Finaali"
            />
          </>
        ) : (
          <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-amber-900">
              Tässä turnauksessa on {teamCount} joukkuetta.
            </p>

            <p className="mt-1 text-sm text-amber-800">
              Tämän joukkuemäärän pudotuspeliformaattia ei ole vielä määritetty.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function FinalSection({
  tournamentId,
  final,
  teamA,
  teamB,
  finalWinner,
  finalTie,
  title,
}: {
  tournamentId: string;

  final:
    | Awaited<
        ReturnType<typeof getTournamentPlayoffs>
      >[number]
    | undefined;

  teamA:
    | Awaited<
        ReturnType<typeof getTeams>
      >[number]
    | undefined;

  teamB:
    | Awaited<
        ReturnType<typeof getTeams>
      >[number]
    | undefined;

  finalWinner:
    | Awaited<
        ReturnType<typeof getTeams>
      >[number]
    | undefined;

  finalTie: boolean;

  title: string;
}) {
  return (
    <section className="mt-8">
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
            Finaali
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Yksi ottelu. Voittaja on turnauksen mestari.
          </p>
        </div>

        <div className="p-6">
          {teamA && teamB ? (
            <FinalForm
              tournamentId={tournamentId}
              teamA={teamA}
              teamB={teamB}
              existing={final}
            />
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-900">
                Finaali ei ole vielä valmis.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                Tallenna molempien välierien tulokset ensin,
                jotta finalistit voidaan määrittää automaattisesti.
              </p>
            </div>
          )}
        </div>

        {finalWinner && (
          <div className="border-t border-slate-200 bg-violet-50 p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Turnauksen mestari
            </p>

            <p className="mt-3 text-4xl font-black text-slate-950">
              🏆 {finalWinner.name}
            </p>
          </div>
        )}

        {finalTie && (
          <div className="border-t border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-semibold text-amber-900">
              Finaali päättyi tasan.
            </p>

            <p className="mt-1 text-sm text-amber-800">
              Mestarin määrittämiseksi tarvitaan
              tasatilanteen ratkaiseva sääntö.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
}

type QualificationCardProps = {
  position: string;
  teamName: string;
  description: string;
  highlight?: boolean;
  muted?: boolean;
};

function QualificationCard({
  position,
  teamName,
  description,
  highlight = false,
  muted = false,
}: QualificationCardProps) {
  return (
    <div
      className={[
        "rounded-2xl border p-5",
        highlight
          ? "border-violet-200 bg-violet-50"
          : muted
            ? "border-slate-200 bg-slate-50"
            : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-bold uppercase tracking-wide",
          highlight
            ? "text-violet-600"
            : "text-slate-500",
        ].join(" ")}
      >
        {position}
      </p>

      <h3
        className={[
          "mt-2 text-lg font-bold",
          muted
            ? "text-slate-500"
            : "text-slate-950",
        ].join(" ")}
      >
        {teamName}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}