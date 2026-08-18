import Link from "next/link";

type TournamentTabsProps = {
  tournamentId: string;
  activeTab: "overview" | "teams" | "regular-season" | "playoffs" | "results";
};

const tabs = [
  {
    id: "overview",
    label: "Overview",
    path: "",
  },
  {
    id: "teams",
    label: "Teams",
    path: "",
  },
  {
    id: "regular-season",
    label: "Regular Season",
    path: "/regular-season",
  },
  {
    id: "playoffs",
    label: "Playoffs",
    path: "/playoffs",
  },
  {
    id: "results",
    label: "Results",
    path: "/results",
  },
] as const;

export function TournamentTabs({
  tournamentId,
  activeTab,
}: TournamentTabsProps) {
  return (
    <div className="mt-8 overflow-x-auto">
      <div className="flex min-w-max gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const href =
            tab.id === "overview" || tab.id === "teams"
              ? `/tournaments/${tournamentId}`
              : `/tournaments/${tournamentId}${tab.path}`;

          const active =
            activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={href}
              className={[
                "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}