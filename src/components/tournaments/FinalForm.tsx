"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { saveFinalAction } from "@/app/tournaments/actions";
import type {
  PlayoffTie,
  Team,
} from "@/types";

type FinalFormProps = {
  tournamentId: string;
  teamA: Team;
  teamB: Team;
  existing?: PlayoffTie;
};

export function FinalForm({
  tournamentId,
  teamA,
  teamB,
  existing,
}: FinalFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [scoreA, setScoreA] =
    useState(
      existing?.leg1TeamAScore !== null &&
        existing?.leg1TeamAScore !==
          undefined
        ? String(
            existing.leg1TeamAScore,
          )
        : "",
    );

  const [scoreB, setScoreB] =
    useState(
      existing?.leg1TeamBScore !== null &&
        existing?.leg1TeamBScore !==
          undefined
        ? String(
            existing.leg1TeamBScore,
          )
        : "",
    );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) {
      setScoreA("");
      setScoreB("");
      return;
    }

    setScoreA(
      existing.leg1TeamAScore !== null
        ? String(
            existing.leg1TeamAScore,
          )
        : "",
    );

    setScoreB(
      existing.leg1TeamBScore !== null
        ? String(
            existing.leg1TeamBScore,
          )
        : "",
    );
  }, [existing]);

  const winner = useMemo(() => {
    if (
      scoreA === "" ||
      scoreB === ""
    ) {
      return null;
    }

    const a = Number(scoreA);
    const b = Number(scoreB);

    if (a === b) {
      return "draw";
    }

    return a > b ? "teamA" : "teamB";
  }, [scoreA, scoreB]);

  const winnerTeam =
    winner === "teamA"
      ? teamA
      : winner === "teamB"
        ? teamB
        : null;

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (
      scoreA === "" ||
      scoreB === ""
    ) {
      setError(
        "Enter the final score.",
      );

      return;
    }

    const formData = new FormData();

    formData.set(
      "tournamentId",
      tournamentId,
    );

    formData.set(
      "teamAId",
      teamA.id,
    );

    formData.set(
      "teamBId",
      teamB.id,
    );

    formData.set(
      "teamAScore",
      scoreA,
    );

    formData.set(
      "teamBScore",
      scoreB,
    );

    startTransition(async () => {
      const result =
        await saveFinalAction(
          formData,
        );

      if (!result.success) {
        setError(
          result.error ??
            "Failed to save final.",
        );

        return;
      }

      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
            Finalist 1
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {teamA.name}
          </h3>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={scoreA}
            onChange={(event) =>
              setScoreA(
                event.target.value,
              )
            }
            className="mt-4 w-20 rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-xl font-black outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
            Finalist 2
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {teamB.name}
          </h3>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={scoreB}
            onChange={(event) =>
              setScoreB(
                event.target.value,
              )
            }
            className="mt-4 w-20 rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-xl font-black outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>

      {winnerTeam && (
        <div className="rounded-2xl bg-slate-950 p-6 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-400">
            Champion
          </p>

          <p className="mt-3 text-3xl font-black">
            🏆 {winnerTeam.name}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            {scoreA} – {scoreB}
          </p>
        </div>
      )}

      {winner === "draw" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          The final is tied. We need to add the
          tie-break method before a champion can be
          determined.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          scoreA === "" ||
          scoreB === ""
        }
        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save final"}
      </button>
    </form>
  );
}