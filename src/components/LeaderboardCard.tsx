"use client";

import { useState } from "react";

import { Card } from "@/components/Card";

export type PlayerPerformance = {
  id: string;
  name: string;
  wins: number;
  secondPlaces: number;
  thirdPlaces: number;
};

type LeaderboardCardProps = {
  title: string;
  icon: string;
  players: PlayerPerformance[];
  valueKey: "wins" | "secondPlaces" | "thirdPlaces";
};

export function LeaderboardCard({
  title,
  icon,
  players,
  valueKey,
}: LeaderboardCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const visiblePlayers = players.slice(0, 3);
  const canOpenFullList = players.length > 0;
  const fullPlayerList = players;

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {icon}
            </span>
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
          </div>

          {canOpenFullList && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 transition hover:bg-violet-100"
            >
              {players.length > 3 ? "Näytä kaikki" : "Näytä lista"}
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {visiblePlayers.length ? (
            visiblePlayers.map((player, index) => (
              <div
                key={`${title}-${player.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{player.name}</span>
                </div>

                <span className="text-sm font-black text-slate-950">{player[valueKey]}</span>
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
              No results yet.
            </p>
          )}
        </div>
      </Card>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} - koko lista`}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">
                  {icon}
                </span>
                <div>
                  <h3 className="text-lg font-black">{title}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/15"
                aria-label="Sulje lista"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="space-y-3">
                {fullPlayerList.length ? (
                  fullPlayerList.map((player, index) => (
                    <div
                      key={`${title}-full-${player.id}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-black text-violet-700">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-900">{player.name}</span>
                      </div>

                      <span className="text-base font-black text-slate-950">{player[valueKey]}</span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
                    No results yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
