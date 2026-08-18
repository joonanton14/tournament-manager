"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Tournament } from "@/types";

type TournamentSelectorProps = {
  tournaments: Tournament[];
  selectedTournamentId?: string;
};

export function TournamentSelector({
  tournaments,
  selectedTournamentId,
}: TournamentSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const tournamentId = event.target.value;

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (tournamentId) {
      params.set("tournament", tournamentId);
    } else {
      params.delete("tournament");
    }

    router.push(
      `/statistics?${params.toString()}`,
    );
  }

  return (
    <select
      value={selectedTournamentId ?? ""}
      onChange={handleChange}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
    >
      <option value="">
        Select tournament
      </option>

      {tournaments.map((tournament) => (
        <option
          key={tournament.id}
          value={tournament.id}
        >
          #{tournament.number} — {tournament.name}
        </option>
      ))}
    </select>
  );
}