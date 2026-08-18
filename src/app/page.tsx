import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";

const stats = [
  {
    label: "Tournaments",
    value: "10",
    description: "Historical tournaments",
  },
  {
    label: "Players",
    value: "—",
    description: "Players in the database",
  },
  {
    label: "Matches",
    value: "—",
    description: "Matches played",
  },
  {
    label: "Goals",
    value: "—",
    description: "Goals scored",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_55%)]" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-600" />
              FIFA Tournament Manager
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Every tournament.
              <span className="block text-violet-600">
                Every match. Every goal.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Keep your FIFA tournament history in one place. Track teams,
              players, match results and scorers across every tournament.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/statistics">
                View statistics
              </Button>

              <Button href="/statistics" variant="secondary">
                Tournament history
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                description={stat.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Tournament 10
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                The next chapter starts here.
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600">
                Add the teams, assign the players and record every match as
                the tournament progresses. Previous tournaments can be added
                later using the same data structure.
              </p>

              <div className="mt-7">
                <Button href="/tournaments/10">
                  Open tournament 10
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Current tournament</p>
                    <h3 className="mt-1 text-2xl font-bold">
                      FIFA Tournament 10
                    </h3>
                  </div>

                  <div className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-bold">
                    #10
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500">
                    Teams
                  </p>
                  <p className="mt-2 text-2xl font-bold">—</p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500">
                    Matches
                  </p>
                  <p className="mt-2 text-2xl font-bold">—</p>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-slate-500">
                    Goals
                  </p>
                  <p className="mt-2 text-2xl font-bold">—</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Everything in one place
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="Tournaments"
            description="Browse every tournament and see teams, matches, results and standings."
            href="/tournaments"
          />

          <FeatureCard
            title="Players"
            description="Keep a permanent player database and track their tournament history."
            href="/players"
          />

          <FeatureCard
            title="Statistics"
            description="Compare players, teams and tournaments using the results we collect."
            href="/statistics"
          />
        </div>
      </section>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
};

function FeatureCard({
  title,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-6 transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-200 group-hover:shadow-lg group-hover:shadow-violet-500/10">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
          {title.slice(0, 1)}
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-2 leading-6 text-slate-600">
          {description}
        </p>

        <div className="mt-6 text-sm font-semibold text-violet-600 transition group-hover:text-violet-700">
          Explore →
        </div>
      </Card>
    </Link>
  );
}