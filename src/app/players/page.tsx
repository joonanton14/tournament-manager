import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PlayerForm } from "@/components/players/PlayerForm";
import { PlayerList } from "@/components/players/PlayerList";
import { getPlayers } from "@/lib/players";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
    const players = await getPlayers();

    return (
        <div className="min-h-[calc(100vh-72px)]">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                            Database
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                            Players
                        </h1>

                        <p className="mt-3 max-w-2xl text-slate-600">
                            Manage the players who participate in your FIFA tournaments.
                            Each player is stored once and can be reused across all
                            tournaments.
                        </p>
                    </div>

                    <Button href="#add-player">
                        + Add player
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
                    <div id="add-player">
                        <Card className="h-fit p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-slate-950">
                                    Add player
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Create a player once and reuse them across every
                                    tournament.
                                </p>
                            </div>

                            <PlayerForm />
                        </Card>
                    </div>

                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">
                                    All players
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {players.length}{" "}
                                    {players.length === 1 ? "player" : "players"}
                                </p>
                            </div>
                        </div>

                        <PlayerList players={players} />
                    </div>
                </div>
            </div>
        </div >
    );
}