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

import {
  getTournamentPlayoffs,
} from "@/lib/playoffs";

import {
  getTournamentStandings,
} from "@/lib/standings";

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

  const teamsWithStandings =
    tournamentTeamDetails
      .map(
        ({
          tournamentTeam,
          team,
        }) => ({
          tournamentTeam,
          team,
          standing: standings.find(
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

  const isFourTeamFormat =
    teamsWithStandings.length === 4;

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

  const fourTeamExistingSemiFinal =
    semiFinal1 &&
    secondPlace &&
    thirdPlace &&
    semiFinal1.teamAId ===
      secondPlace.team.id &&
    semiFinal1.teamBId ===
      thirdPlace.team.id
      ? semiFinal1
      : undefined;

  const allTeams =
    tournamentTeamDetails.map(
      ({ team }) => team,
    );

  /*
   * Calculate the winner of the four-team
   * semi-final from the two legs.
   */
  let semiFinalWinnerTeamId:
    | string
    | null = null;

  let semiFinalTie = false;

  if (fourTeamExistingSemiFinal) {
    const {
      leg1TeamAScore,
      leg1TeamBScore,
      leg2TeamAScore,
      leg2TeamBScore,
      teamAId,
      teamBId,
    } = fourTeamExistingSemiFinal;

    const scoresAvailable =
      leg1TeamAScore !== null &&
      leg1TeamBScore !== null &&
      leg2TeamAScore !== null &&
      leg2TeamBScore !== null;

    if (scoresAvailable) {
      const teamAScore =
        leg1TeamAScore +
        leg2TeamAScore;

      const teamBScore =
        leg1TeamBScore +
        leg2TeamBScore;

      if (
        teamAScore > teamBScore
      ) {
        semiFinalWinnerTeamId =
          teamAId;
      } else if (
        teamBScore > teamAScore
      ) {
        semiFinalWinnerTeamId =
          teamBId;
      } else {
        semiFinalTie = true;
      }
    }
  }

  const semiFinalWinner =
    semiFinalWinnerTeamId
      ? allTeams.find(
          (team) =>
            team.id ===
            semiFinalWinnerTeamId,
        )
      : undefined;

  const finalTeamA =
    firstPlace?.team;

  const finalTeamB =
    semiFinalWinner;

  const finalWinner =
    final?.leg1TeamAScore !== null &&
    final?.leg1TeamAScore !== undefined &&
    final?.leg1TeamBScore !== null &&
    final?.leg1TeamBScore !== undefined
      ? final.leg1TeamAScore >
        final.leg1TeamBScore
        ? finalTeamA
        : final.leg1TeamBScore >
            final.leg1TeamAScore
          ? finalTeamB
          : null
      : null;

  const finalIsDraw =
    final?.leg1TeamAScore !== null &&
    final?.leg1TeamAScore !== undefined &&
    final?.leg1TeamBScore !== null &&
    final?.leg1TeamBScore !== undefined &&
    final.leg1TeamAScore ===
      final.leg1TeamBScore;

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
            <section className="mt-8">
              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-950 p-6 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-violet-400">
                    Four-team format
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Playoff qualification
                  </h2>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <QualificationCard
                    position="1st"
                    teamName={
                      firstPlace?.team.name ??
                      "Unknown"
                    }
                    description="Direct to final"
                    highlight
                  />

                  <QualificationCard
                    position="2nd"
                    teamName={
                      secondPlace?.team.name ??
                      "Unknown"
                    }
                    description="Semi-final"
                  />

                  <QualificationCard
                    position="3rd"
                    teamName={
                      thirdPlace?.team.name ??
                      "Unknown"
                    }
                    description="Semi-final"
                  />

                  <QualificationCard
                    position="4th"
                    teamName={
                      fourthPlace?.team.name ??
                      "Unknown"
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
                    Two games. Aggregate score decides who
                    advances.
                  </p>
                </div>

                <div className="p-6">
                  {secondPlace &&
                  thirdPlace ? (
                    <SemiFinalForm
                      tournamentId={
                        tournament.id
                      }
                      number={1}
                      teams={allTeams}
                      existing={
                        fourTeamExistingSemiFinal
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
                      Positions 2 and 3 are required.
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
                    One game. The winner becomes tournament
                    champion.
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
                      {semiFinalTie ? (
                        <>
                          <p className="font-semibold text-amber-900">
                            The semi-final is tied on aggregate.
                          </p>

                          <p className="mt-1 text-sm text-amber-800">
                            Resolve the semi-final tie before
                            the finalists can be determined.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-amber-900">
                            Final not ready yet.
                          </p>

                          <p className="mt-1 text-sm text-amber-800">
                            Enter and save both semi-final
                            results first.
                          </p>
                        </>
                      )}
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

                {finalIsDraw && (
                  <div className="border-t border-amber-200 bg-amber-50 p-6 text-center">
                    <p className="font-semibold text-amber-900">
                      The final ended in a draw.
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      We need the final tie-break rule before
                      selecting the champion.
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
                {teamsWithStandings.length} teams found.
              </p>

              <p className="mt-1 text-sm text-amber-800">
                This tournament does not use the four-team
                playoff format. For now, configure its
                semi-finals manually.
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
                    tournamentId={
                      tournament.id
                    }
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
                    tournamentId={
                      tournament.id
                    }
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