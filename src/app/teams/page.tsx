import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TeamForm } from "@/components/teams/TeamForm";
import { TeamList } from "@/components/teams/TeamList";
import { getTeams } from "@/lib/teams";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Database
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Teams
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Manage the football teams that can be used across your
              tournaments.
            </p>
          </div>

          <Button href="#add-team">
            + Add team
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div id="add-team">
            <Card className="h-fit p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Add team
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Create a team once and reuse it in different tournaments.
                </p>
              </div>

              <TeamForm />
            </Card>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  All teams
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {teams.length}{" "}
                  {teams.length === 1 ? "team" : "teams"}
                </p>
              </div>
            </div>

            <TeamList teams={teams} />
          </div>
        </div>
      </div>
    </div>
  );
}