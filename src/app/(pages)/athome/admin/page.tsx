"use client";

import { useSession, signIn } from "next-auth/react";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { api } from "~/trpc/react";
import { TASKS } from "rbrgs/lib/athome-tasks";

export default function AtHomeAdminPage() {
  const session = useSession();

  const { data: userData } = api.athome.getAllSessions.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  // Auth guard
  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Sign in to view the overview.</p>
        <Button onClick={() => signIn("google")} className="bg-roboblue">
          Sign in with Google
        </Button>
      </main>
    );
  }

  if (session.status === "loading") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  const judges = userData ?? [];

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="Overview" subtitle="RoboCup@Home 2026 — Results by Judge" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <h2 className="text-xl font-bold mb-2">Final Standings (Best per Judge)</h2>
          <p className="text-sm text-gray-500">
            Current consolidated results. Each judge shows their best recording per task.
          </p>
        </div>

        {/* Simplified Leaderboard Table */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-x-auto mb-8 shadow-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left p-4 text-gray-300 font-bold uppercase tracking-wider">Judge / Team</th>
                {TASKS.map((t) => (
                  <th
                    key={t.id}
                    className="text-right p-4 text-gray-400 whitespace-nowrap font-medium"
                  >
                    {t.name}
                  </th>
                ))}
                <th className="text-right p-4 text-gray-300 font-bold whitespace-nowrap">
                   Best Total
                </th>
                <th className="text-center p-4 text-gray-300 font-bold whitespace-nowrap">
                  Inspection
                </th>
              </tr>
            </thead>
            <tbody>
              {judges.length === 0 && (
                <tr>
                  <td
                    colSpan={TASKS.length + 3}
                    className="p-12 text-center text-gray-500 italic"
                  >
                    No data recorded yet
                  </td>
                </tr>
              )}
              {judges.map((j) => {
                // Calculate BEST scores per task for this judge
                const judgeBestMap = new Map<string, number>();
                for (const score of j.scores) {
                  const currentBest = judgeBestMap.get(score.taskId) ?? -Infinity;
                  if (score.totalScore > currentBest) {
                    judgeBestMap.set(score.taskId, score.totalScore);
                  }
                }

                let judgeBestTotal = 0;
                judgeBestMap.forEach((v) => (judgeBestTotal += v));

                const inspectionPassed = j.inspections?.passed ?? false;
                const hasInspection = !!j.inspections;

                return (
                  <tr key={j.id} className="border-b border-gray-700/30 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {j.user.image ? (
                          <img
                            src={j.user.image}
                            alt=""
                            className="h-8 w-8 rounded-full border border-gray-700"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">
                             {j.user.name?.charAt(0) ?? "?"}
                          </div>
                        )}
                        <div>
                          <span className="block font-medium">{j.user.name ?? "Unknown Judge"}</span>
                          <span className="block text-xs text-gray-500">
                            {j.user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    {TASKS.map((t) => {
                      const score = judgeBestMap.get(t.id);
                      return (
                        <td
                          key={t.id}
                          className={`p-4 text-right font-mono ${
                                score !== undefined
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                        >
                          {score !== undefined ? score : "—"}
                        </td>
                      );
                    })}

                    <td className="p-4 text-right">
                       <span className="text-lg font-bold text-emerald-400 font-mono">
                         {judgeBestTotal}
                       </span>
                    </td>

                    <td className="p-4 text-center">
                       {hasInspection ? (
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${inspectionPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                           {inspectionPassed ? "PASSED" : "FAILED"}
                         </span>
                       ) : (
                         <span className="text-gray-700 text-xs">—</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
