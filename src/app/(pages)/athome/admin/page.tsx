"use client";

import { useSession, signIn } from "next-auth/react";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { api } from "~/trpc/react";
import { TASKS, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function AtHomeAdminPage() {
  const session = useSession();

  const { data: allSessions } = api.athome.getAllSessions.useQuery(undefined, {
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

  const sessions = allSessions ?? [];

  // Best per task across all sessions
  const bestPerTask = new Map<string, number>();
  for (const s of sessions) {
    for (const score of s.scores) {
      const cur = bestPerTask.get(score.taskId) ?? -Infinity;
      if (score.totalScore > cur) bestPerTask.set(score.taskId, score.totalScore);
    }
  }
  let bestTotal = 0;
  for (const [, v] of bestPerTask) bestTotal += v;

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="All Sessions" subtitle="RoboCup@Home 2026 — Overview" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        {/* Best Total */}
        <div className="mb-6 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-center">
          <p className="text-sm text-gray-400">Best Combined Total (across all sessions)</p>
          <p className="text-4xl font-bold text-emerald-400">{bestTotal}</p>
        </div>

        {/* Sessions Table */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left p-3 text-gray-400 whitespace-nowrap">Judge</th>
                <th className="text-left p-3 text-gray-400 whitespace-nowrap">Session</th>
                <th className="text-left p-3 text-gray-400 whitespace-nowrap">Date</th>
                {TASKS.map((t) => (
                  <th
                    key={t.id}
                    className="text-right p-3 text-gray-400 whitespace-nowrap"
                  >
                    {t.name.length > 12 ? t.name.slice(0, 12) + "…" : t.name}
                  </th>
                ))}
                <th className="text-right p-3 text-gray-400 whitespace-nowrap">
                  Total
                </th>
                <th className="text-right p-3 text-gray-400 whitespace-nowrap">
                  Inspection
                </th>
                <th className="text-center p-3 text-gray-400 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td
                    colSpan={TASKS.length + 5}
                    className="p-6 text-center text-gray-500"
                  >
                    No sessions recorded yet
                  </td>
                </tr>
              )}
              {sessions.map((s) => {
                const scoreMap = new Map(
                  s.scores.map((sc) => [sc.taskId, sc.totalScore]),
                );
                let sessionTotal = 0;
                for (const sc of s.scores) sessionTotal += sc.totalScore;
                const insp = s.inspections[0];

                return (
                  <tr key={s.id} className="border-b border-gray-700/50">
                    <td className="p-3 text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {s.user.image && (
                          <img
                            src={s.user.image}
                            alt=""
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <div>
                          <span className="block text-sm">{s.user.name ?? "Unknown"}</span>
                          <span className="block text-xs text-gray-500">
                            {s.user.email ?? ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-300 whitespace-nowrap text-xs">
                      {s.label ?? "Untitled"}
                    </td>
                    <td className="p-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </td>
                    {TASKS.map((t) => {
                      const score = scoreMap.get(t.id);
                      const isBest =
                        score !== undefined && score === bestPerTask.get(t.id);
                      return (
                        <td
                          key={t.id}
                          className={`p-3 text-right font-mono ${isBest
                              ? "text-emerald-400 font-bold"
                              : score !== undefined
                                ? "text-white"
                                : "text-gray-600"
                            }`}
                        >
                          {score ?? "—"}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {sessionTotal}
                    </td>
                    <td className="p-3 text-right">
                      {insp ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${insp.passed
                              ? "bg-emerald-400/20 text-emerald-400"
                              : "bg-yellow-400/20 text-yellow-400"
                            }`}
                        >
                          {insp.passed ? "PASS" : "FAIL"}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.finishedAt
                            ? "bg-gray-700 text-gray-400"
                            : "bg-roboblue/20 text-roboblue"
                          }`}
                      >
                        {s.finishedAt ? "Finished" : "Active"}
                      </span>
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
