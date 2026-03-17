"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import Header from "rbrgs/app/_components/header";
import { api } from "~/trpc/react";
import { TASKS, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function AtHomeAdminPage() {
  const session = useSession();

  const { data: allScores } = api.athome.scoreGetAll.useQuery(undefined, {
    enabled: session.data?.user?.role === Role.ADMIN,
  });
  const { data: allInspections } = api.athome.inspectionGetAll.useQuery(
    undefined,
    { enabled: session.data?.user?.role === Role.ADMIN },
  );

  if (session.data?.user?.role !== Role.ADMIN) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <Header title="Admin" subtitle="" />
        <p className="text-center text-xl mt-8">Admin access required.</p>
      </main>
    );
  }

  // Build judge → task → score map
  const judgeMap = new Map<
    string,
    { name: string; email: string; scores: Map<string, number> }
  >();

  for (const s of allScores ?? []) {
    if (!judgeMap.has(s.judgeId)) {
      judgeMap.set(s.judgeId, {
        name: s.judge.name ?? "Unknown",
        email: s.judge.email ?? "",
        scores: new Map(),
      });
    }
    judgeMap.get(s.judgeId)!.scores.set(s.taskId, s.totalScore);
  }

  // Find best per task
  const bestPerTask = new Map<string, number>();
  for (const [, j] of judgeMap) {
    for (const [tid, score] of j.scores) {
      const cur = bestPerTask.get(tid) ?? -Infinity;
      if (score > cur) bestPerTask.set(tid, score);
    }
  }

  // Grand best total
  let bestTotal = 0;
  for (const [, v] of bestPerTask) bestTotal += v;

  // Inspection map
  const inspectionMap = new Map<
    string,
    { passed: boolean; checked: number }
  >();
  for (const insp of allInspections ?? []) {
    const cl = (insp.checklist ?? {}) as Record<string, boolean>;
    const checked = ALL_INSPECTION_KEYS.filter((k) => cl[k]).length;
    inspectionMap.set(insp.judgeId, { passed: insp.passed, checked });
  }

  const judges = Array.from(judgeMap.entries());

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="Admin Panel" subtitle="RoboCup@Home 2026" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        {/* Best Total */}
        <div className="mb-6 rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-center">
          <p className="text-sm text-gray-400">Best Combined Total</p>
          <p className="text-4xl font-bold text-emerald-400">{bestTotal}</p>
        </div>

        {/* Scores Table */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left p-3 text-gray-400 whitespace-nowrap">Judge</th>
                {TASKS.map((t) => (
                  <th
                    key={t.id}
                    className="text-right p-3 text-gray-400 whitespace-nowrap"
                  >
                    {t.name}
                  </th>
                ))}
                <th className="text-right p-3 text-gray-400 whitespace-nowrap">
                  Total
                </th>
                <th className="text-right p-3 text-gray-400 whitespace-nowrap">
                  Inspection
                </th>
              </tr>
            </thead>
            <tbody>
              {judges.length === 0 && (
                <tr>
                  <td
                    colSpan={TASKS.length + 3}
                    className="p-6 text-center text-gray-500"
                  >
                    No scores recorded yet
                  </td>
                </tr>
              )}
              {judges.map(([judgeId, judge]) => {
                let judgeTotal = 0;
                const insp = inspectionMap.get(judgeId);
                return (
                  <tr key={judgeId} className="border-b border-gray-700/50">
                    <td className="p-3 text-white whitespace-nowrap">
                      {judge.name}
                      <span className="block text-xs text-gray-500">
                        {judge.email}
                      </span>
                    </td>
                    {TASKS.map((t) => {
                      const score = judge.scores.get(t.id);
                      if (score !== undefined) judgeTotal += score;
                      const isBest = score !== undefined && score === bestPerTask.get(t.id);
                      return (
                        <td
                          key={t.id}
                          className={`p-3 text-right font-mono ${
                            isBest
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
                      {judgeTotal}
                    </td>
                    <td className="p-3 text-right">
                      {insp ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            insp.passed
                              ? "bg-emerald-400/20 text-emerald-400"
                              : "bg-yellow-400/20 text-yellow-400"
                          }`}
                        >
                          {insp.passed ? "PASS" : `${insp.checked}/${ALL_INSPECTION_KEYS.length}`}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
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
