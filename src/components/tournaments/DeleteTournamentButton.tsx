"use client";

import { deleteTournamentAction } from "@/app/tournaments/actions";

type DeleteTournamentButtonProps = {
  tournamentId: string;
  tournamentName: string;
};

export function DeleteTournamentButton({ tournamentId, tournamentName }: DeleteTournamentButtonProps) {
  return (
    <form
      action={deleteTournamentAction}
      className="mt-6 border-t border-red-200 pt-5"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Poistetaanko turnaus "${tournamentName}"? Kaikki joukkueet, ottelut ja sarjataulukko poistetaan.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tournamentId" value={tournamentId} />

      <button
        type="submit"
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
      >
        Poista turnaus
      </button>
    </form>
  );
}
