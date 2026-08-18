"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveSemiFinalAction } from "@/app/tournaments/actions";
import type {
  PlayoffTie,
  Team,
} from "@/types";

type SemiFinalFormProps = {
  tournamentId: string;
  number: number;
  teams: Team[];
  existing?: PlayoffTie;
};

export function SemiFinalForm({
  tournamentId,
  number,
  teams,
  existing,
}: SemiFinalFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [teamAId, setTeamAId] = useState(
    existing?.teamAId ?? "",
  );

  const [teamBId, setTeamBId] = useState(
    existing?.teamBId ?? "",
  );

  const [leg1A, setLeg1A] = useState(
    existing?.leg1TeamAScore !== null &&
      existing?.leg1TeamAScore !== undefined
      ? String(existing.leg1TeamAScore)
      : "",
  );

  const [leg1B, setLeg1B] = useState(
    existing?.leg1TeamBScore !== null &&
      existing?.leg1TeamBScore !== undefined
      ? String(existing.leg1TeamBScore)
      : "",
  );

  const [leg2A, setLeg2A] = useState(
    existing?.leg2TeamAScore !== null &&
      existing?.leg2TeamAScore !== undefined
      ? String(existing.leg2TeamAScore)
      : "",
  );

  const [leg2B, setLeg2B] = useState(
    existing?.leg2TeamBScore !== null &&
      existing?.leg2TeamBScore !== undefined
      ? String(existing.leg2TeamBScore)
      : "",
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) {
      return;
    }

    setTeamAId(existing.teamAId);
    setTeamBId(existing.teamBId);

    setLeg1A(
      existing.leg1TeamAScore !== null
        ? String(existing.leg1TeamAScore)
        : "",
    );

    setLeg1B(
      existing.leg1TeamBScore !== null
        ? String(existing.leg1TeamBScore)
        : "",
    );

    setLeg2A(
      existing.leg2TeamAScore !== null
        ? String(existing.leg2TeamAScore)
        : "",
    );

    setLeg2B(
      existing.leg2TeamBScore !== null
        ? String(existing.leg2TeamBScore)
        : "",
    );
  }, [existing]);

  const teamA = teams.find(
    (team) => team.id === teamAId,
  );

  const teamB = teams.find(
    (team) => team.id === teamBId,
  );

  const aggregate = useMemo(() => {
    if (
      leg1A === "" ||
      leg1B === "" ||
      leg2A === "" ||
      leg2B === ""
    ) {
      return null;
    }

    const a =
      Number(leg1A) + Number(leg2A);

    const b =
      Number(leg1B) + Number(leg2B);

    return {
      teamA: a,
      teamB: b,
    };
  }, [
    leg1A,
    leg1B,
    leg2A,
    leg2B,
  ]);

  const winner = useMemo(() => {
    if (!aggregate) {
      return null;
    }

    if (
      aggregate.teamA ===
      aggregate.teamB
    ) {
      return "draw";
    }

    return aggregate.teamA >
      aggregate.teamB
      ? "teamA"
      : "teamB";
  }, [aggregate]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!teamAId || !teamBId) {
      setError(
        "Select both semi-final teams.",
      );
      return;
    }

    if (teamAId === teamBId) {
      setError(
        "Semi-final teams must be different.",
      );
      return;
    }

    const formData = new FormData();

    formData.set(
      "tournamentId",
      tournamentId,
    );

    formData.set(
      "number",
      String(number),
    );

    formData.set(
      "teamAId",
      teamAId,
    );

    formData.set(
      "teamBId",
      teamBId,
    );

    formData.set(
      "leg1TeamAScore",
      leg1A,
    );

    formData.set(
      "leg1TeamBScore",
      leg1B,
    );

    formData.set(
      "leg2TeamAScore",
      leg2A,
    );

    formData.set(
      "leg2TeamBScore",
      leg2B,
    );

    startTransition(async () => {
      const result =
        await saveSemiFinalAction(
          formData,
        );

      if (!result.success) {
        setError(
          result.error ??
            "Failed to save semi-final.",
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
        <div>
          <label
            htmlFor={`team-a-${number}`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Team A
          </label>

          <select
            id={`team-a-${number}`}
            value={teamAId}
            onChange={(event) =>
              setTeamAId(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">
              Select team...
            </option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`team-b-${number}`}
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Team B
          </label>

          <select
            id={`team-b-${number}`}
            value={teamBId}
            onChange={(event) =>
              setTeamBId(event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">
              Select team...
            </option>

            {teams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreBox
          title="Game 1"
          teamA={teamA?.name ?? "Team A"}
          teamB={teamB?.name ?? "Team B"}
          scoreA={leg1A}
          scoreB={leg1B}
          onScoreA={setLeg1A}
          onScoreB={setLeg1B}
        />

        <ScoreBox
          title="Game 2"
          teamA={teamA?.name ?? "Team A"}
          teamB={teamB?.name ?? "Team B"}
          scoreA={leg2A}
          scoreB={leg2B}
          onScoreA={setLeg2A}
          onScoreB={setLeg2B}
        />
      </div>

      {aggregate && (
        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-semibold text-slate-400">
            Aggregate
          </p>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold">
                {teamA?.name ?? "Team A"}
              </p>

              <p className="mt-1 text-3xl font-black">
                {aggregate.teamA}
              </p>
            </div>

            <div className="text-slate-500">
              –
            </div>

            <div className="text-right">
              <p className="font-bold">
                {teamB?.name ?? "Team B"}
              </p>

              <p className="mt-1 text-3xl font-black">
                {aggregate.teamB}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4">
            {winner === "teamA" && (
              <p className="font-semibold text-violet-400">
                {teamA?.name} advances to the final
              </p>
            )}

            {winner === "teamB" && (
              <p className="font-semibold text-violet-400">
                {teamB?.name} advances to the final
              </p>
            )}

            {winner === "draw" && (
              <p className="font-semibold text-amber-400">
                Aggregate is tied. We need a tie-break rule.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : `Save semi-final ${number}`}
      </button>
    </form>
  );
}

type ScoreBoxProps = {
  title: string;
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
  onScoreA: (value: string) => void;
  onScoreB: (value: string) => void;
};

function ScoreBox({
  title,
  teamA,
  teamB,
  scoreA,
  scoreB,
  onScoreA,
  onScoreB,
}: ScoreBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-violet-600">
        {title}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
            {teamA}
          </span>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={scoreA}
            onChange={(event) =>
              onScoreA(event.target.value)
            }
            className="w-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-bold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="min-w-0 truncate text-sm font-semibold text-slate-800">
            {teamB}
          </span>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={scoreB}
            onChange={(event) =>
              onScoreB(event.target.value)
            }
            className="w-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-bold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>
    </div>
  );
}