import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/Card";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";
import { SemiFinalForm } from "@/components/tournaments/SemiFinalForm";
import { FinalForm } from "@/components/tournaments/FinalForm";

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

export default async function PlayoffsPage({
  params,
}: PlayoffsPageProps) {
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

  /*
   * The actual tournament format is based on the
   * number of teams participating, not the number
   * of standings records currently saved.
   */
  const isFourTeamFormat =
    tournamentTeamDetails.length === 4;

  /*
   * Combine tournament teams with their regular
   * season standing.
   */
  const teamsWithStandings =
    tournamentTeamDetails
      .map(({ tournamentTeam, team }) => {
        const standing = standings.find(
          (item) =>
            item.tournamentTeamId ===
            tournamentTeam.id,
        );

        return {
          tournamentTeam,
          team,
          standing,
        };
      })
      .sort((a, b) => {
        const positionA =
          a.standing?.position ?? 999;

        const positionB =
          b.standing?.position ?? 999;

        return positionA - positionB;
      });

  /*
   * Only teams with a saved position can be used
   * for playoff qualification.
   */
  const rankedTeams =
    teamsWithStandings.filter(
      (item) => item.standing !== undefined,
    );

  /*
   * For the four-team format:
   *
   * rankedTeams[0] = 1st
   * rankedTeams[1] = 2nd
   * rankedTeams[2] = 3rd
   * rankedTeams[3] = 4th
   */
  const firstPlace = isFourTeamFormat
    ? rankedTeams[0]
    : undefined;

  const secondPlace = isFourTeamFormat
    ? rankedTeams[1]
    : undefined;

  const thirdPlace = isFourTeamFormat
    ? rankedTeams[2]
    : undefined;

  const fourthPlace = isFourTeamFormat
    ? rankedTeams[3]
    : undefined;

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
   * Find the existing four-team semi-final.
   *
   * We accept either team order so an old saved record
   * cannot prevent the winner from being recognised.
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
   * Calculate the semi-final winner from the
   * aggregate of the two legs.
   */
  let semiFinalWinnerTeamId:
    | string
    | null = null;

  let semiFinalTie = false;

  if (fourTeamSemiFinal) {
    const {
      teamAId,
      teamBId,
      leg1TeamAScore,
      leg1TeamBScore,
      leg2TeamAScore,
      leg2TeamBScore,
    } = fourTeamSemiFinal;

    const scoresAvailable =
      leg1TeamAScore !== null &&
      leg1TeamBScore !== null &&
      leg2TeamAScore !== null &&
      leg2TeamBScore !== null;

    if (scoresAvailable) {
      const aggregateA =
        leg1TeamAScore +
        leg2TeamAScore;

      const aggregateB =
        leg1TeamBScore +
        leg2TeamBScore;

      if (aggregateA > aggregateB) {
        semiFinalWinnerTeamId = teamAId;
      } else if (
        aggregateB > aggregateA
      ) {
        semiFinalWinnerTeamId = teamBId;
      } else {
        semiFinalTie = true;
      }
    }
  }

  const semiFinalWinner =
    semiFinalWinnerTeamId
      ? tournamentTeamDetails.find(
          ({ team }) =>
            team.id ===
            semiFinalWinnerTeamId,
        )?.team
      : undefined;

  /*
   * The first-place team ALWAYS goes directly
   * to the final in the four-team format.
   */
  const finalTeamA =
    isFourTeamFormat
      ? firstPlace?.team
      : undefined;

  /*
   * The semi-final winner is the second finalist.
   */
  const finalTeamB =
    isFourTeamFormat
      ? semiFinalWinner
      : undefined;

  /*
   * Calculate the final winner.
   */
  let finalWinner:
    | (typeof teams)[number]
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

  const allTeams =
    tournamentTeamDetails.map(
      ({ team }) => team,
    );

  const standingsComplete =
    isFourTeamFormat &&
    rankedTeams.length === 4;

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/tournaments"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to tournaments
        </Link>

        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Tournament #{tournament.number}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            {tournament.name}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Manage the semi-finals and final.
          </p>
        </div>

        <TournamentTabs
          tournamentId={tournament.id}
          activeTab="playoffs"
        />

        {!standings.length ? (
          <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
            <p className="font-semibold text-amber-900">
              Regular-season standings are missing.
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Enter the final regular-season table before
              setting up the playoffs.
            </p>

            <Link
              href={`/tournaments/${tournament.id}/regular-season`}
              className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Enter regular-season table
            </Link>
          </Card>
        ) : isFourTeamFormat ? (
          <>
            {!standingsComplete && (
              <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
                <p className="font-semibold text-amber-900">
                  Four teams found, but the regular-season
                  table is incomplete.
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Save positions for all four teams before
                  the playoff teams can be determined.
                </p>

                <Link
                  href={`/tournaments/${tournament.id}/regular-season`}
                  className="mt-4 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Edit regular-season table
                </Link>
              </Card>
            )}

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
                    Four-team format
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Playoff qualification
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Qualification is determined automatically
                    from the regular-season table.
                  </p>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <QualificationCard
                    position="1st"
                    teamName={
                      firstPlace?.team.name ??
                      "Waiting for standings"
                    }
                    description="Direct to final"
                    highlight
                  />

                  <QualificationCard
                    position="2nd"
                    teamName={
                      secondPlace?.team.name ??
                      "Waiting for standings"
                    }
                    description="Semi-final"
                  />

                  <QualificationCard
                    position="3rd"
                    teamName={
                      thirdPlace?.team.name ??
                      "Waiting for standings"
                    }
                    description="Semi-final"
                  />

                  <QualificationCard
                    position="4th"
                    teamName={
                      fourthPlace?.team.name ??
                      "Waiting for standings"
                    }
                    description="Eliminated"
                    muted
                  />
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Semi-final
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    2nd place vs 3rd place
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Two games. The aggregate winner advances
                    to the final.
                  </p>
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
                  ) : (
                    <p className="text-sm text-slate-500">
                      Save the regular-season positions first.
                    </p>
                  )}
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
                    Final
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Championship match
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    1st place goes directly to the final.
                    The semi-final winner becomes the second
                    finalist.
                  </p>
                </div>

                <div className="p-6">
                  {finalTeamA &&
                  finalTeamB ? (
                    <FinalForm
                      tournamentId={
                        tournament.id
                      }
                      teamA={finalTeamA}
                      teamB={finalTeamB}
                      existing={final}
                    />
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <p className="font-semibold text-amber-900">
                        Finalists
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Finalist 1
                          </p>

                          <p className="mt-1 font-bold text-slate-950">
                            {finalTeamA?.name ??
                              "Waiting for 1st place"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Finalist 2
                          </p>

                          <p className="mt-1 font-bold text-slate-950">
                            {finalTeamB?.name ??
                              (semiFinalTie
                                ? "Semi-final tie"
                                : "Waiting for semi-final winner")}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-amber-800">
                        {semiFinalTie
                          ? "The semi-final is tied on aggregate."
                          : "Save both semi-final scores to determine the second finalist."}
                      </p>
                    </div>
                  )}
                </div>

                {finalWinner && (
                  <div className="border-t border-slate-200 bg-violet-50 p-8 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                      Tournament champion
                    </p>

                    <p className="mt-3 text-4xl font-black text-slate-950">
                      🏆 {finalWinner.name}
                    </p>
                  </div>
                )}

                {finalTie && (
                  <div className="border-t border-amber-200 bg-amber-50 p-6 text-center">
                    <p className="font-semibold text-amber-900">
                      The final ended in a draw.
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      A tie-break rule is required before the
                      champion can be determined.
                    </p>
                  </div>
                )}
              </Card>
            </section>
          </>
        ) : (
          <>
            <Card className="mt-8 border-amber-200 bg-amber-50 p-6">
              <p className="font-semibold text-amber-900">
                {tournamentTeamDetails.length} teams found.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                This tournament uses the manual multi-team
                playoff setup.
              </p>
            </Card>

            <div className="mt-8 space-y-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Semi-final 1
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    First semi-final
                  </h2>
                </div>

                <div className="p-6">
                  <SemiFinalForm
                    tournamentId={tournament.id}
                    number={1}
                    teams={allTeams}
                    existing={semiFinal1}
                  />
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-violet-50 p-6">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
                    Semi-final 2
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Second semi-final
                  </h2>
                </div>

                <div className="p-6">
                  <SemiFinalForm
                    tournamentId={tournament.id}
                    number={2}
                    teams={allTeams}
                    existing={semiFinal2}
                  />
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
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