import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { PlayerForm } from "@/components/players/PlayerForm";
import { getPlayerById } from "@/lib/players";

type PlayerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerPage({
  params,
}: PlayerPageProps) {
  const { id } = await params;

  const player = await getPlayerById(id);

  if (!player) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-72px)]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/players"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to players
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-black">
                  {player.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Player
                  </p>

                  <h1 className="mt-1 text-3xl font-black">
                    {player.name}
                  </h1>

                  {player.nickname && (
                    <p className="mt-1 text-slate-400">
                      @{player.nickname}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  Tournaments
                </p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-500">
                  Goals
                </p>
                <p className="mt-2 text-3xl font-bold">0</p>
              </div>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-bold text-slate-950">
              Edit player
            </h2>

            <p className="mt-1 mb-6 text-sm leading-6 text-slate-500">
              Update the player's name or nickname.
            </p>

            <PlayerForm player={player} />
          </Card>
        </div>
      </div>
    </div>
  );
}