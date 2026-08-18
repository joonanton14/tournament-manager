import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { TeamForm } from "@/components/teams/TeamForm";
import { getTeamById } from "@/lib/teams";

type TeamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TeamPage({
  params,
}: TeamPageProps) {
  const { id } = await params;

  const team = await getTeamById(id);

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/teams"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to teams
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-black">
                  {team.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Team
                  </p>

                  <h1 className="mt-1 text-3xl font-black">
                    {team.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500">
                Tournament usage and player assignments will appear here
                once tournaments are connected.
              </p>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Edit team
            </h2>

            <p className="mt-1 mb-6 text-sm leading-6 text-slate-500">
              Update the team name.
            </p>

            <TeamForm team={team} />
          </Card>
        </div>
      </div>
    </div>
  );
}