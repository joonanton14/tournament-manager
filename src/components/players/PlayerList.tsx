"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePlayerAction } from "@/app/players/actions";
import type { Player } from "@/types";

type PlayerListProps = {
  players: Player[];
};

export function PlayerList({ players }: PlayerListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return players;
    }

    return players.filter((player) => {
      const name = player.name.toLowerCase();
      const nickname = player.nickname?.toLowerCase() ?? "";

      return (
        name.includes(normalizedQuery) ||
        nickname.includes(normalizedQuery)
      );
    });
  }, [players, query]);

  function handleDelete(player: Player) {
    const confirmed = window.confirm(
      `Delete ${player.name}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(player.id);

    startTransition(async () => {
      const result = await deletePlayerAction(player.id);

      setDeletingId(null);

      if (!result.success) {
        window.alert(result.error ?? "Failed to delete player.");
        return;
      }

      router.refresh();
    });
  }

  if (!players.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 font-bold text-violet-700">
          P
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          No players yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Add your first player above. Players can later be assigned to
          teams for each tournament.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search players..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredPlayers.length ? (
          <div className="divide-y divide-slate-100">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/players/${player.id}`}
                  className="group min-w-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-950 group-hover:text-violet-700">
                        {player.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {player.nickname
                          ? `@${player.nickname}`
                          : "No nickname"}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/players/${player.id}?edit=true`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(player)}
                    disabled={
                      isPending && deletingId === player.id
                    }
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === player.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-500">
            No players match your search.
          </div>
        )}
      </div>
    </div>
  );
}