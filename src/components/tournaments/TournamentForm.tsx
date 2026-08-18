"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTournamentAction } from "@/app/tournaments/actions";

export function TournamentForm() {
  const router = useRouter();
  const [isPending, startTransition] =
    useTransition();

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    const formData = new FormData();

    formData.set("number", number);
    formData.set("name", name);
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);

    startTransition(async () => {
      const result =
        await addTournamentAction(formData);

      if (!result.success) {
        setError(
          result.error ??
            "Something went wrong.",
        );
        return;
      }

      router.push(
        `/tournaments/${result.tournamentId}`,
      );
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="number"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Tournament number
        </label>

        <input
          id="number"
          type="number"
          min="1"
          value={number}
          onChange={(event) =>
            setNumber(event.target.value)
          }
          placeholder="10"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Name
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="FIFA Tournament 10"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Start date & time
        </label>

        <input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(event) =>
            setStartDate(event.target.value)
          }
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          End date & time
        </label>

        <input
          id="endDate"
          type="datetime-local"
          value={endDate}
          onChange={(event) =>
            setEndDate(event.target.value)
          }
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Creating..."
          : "Create tournament"}
      </button>
    </form>
  );
}