"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { ConfirmDialog } from "rbrgs/app/_components/athome/ConfirmDialog";
import { api } from "~/trpc/react";
import { TASKS, TASK_MAP, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function ResultsPage() {
  const session = useSession();
  const router = useRouter();
  const utils = api.useUtils();
  const [showReset, setShowReset] = useState(false);

  const { data: myScores } = api.athome.scoreGetMine.useQuery(undefined, {
    enabled: !!session.data?.user,
  });
  const { data: myInspection } = api.athome.inspectionGetMine.useQuery(
    undefined,
    { enabled: !!session.data?.user },
  );

  const resetMutation = api.athome.resetAll.useMutation({
    onSuccess() {
      toast("All scores and inspection reset!");
      void utils.athome.invalidate();
      router.push("/athome");
    },
    onError(err) {
      toast("Error resetting");
      console.error(err);
    },
  });

  if (
    session.data?.user?.role !== Role.ADMIN &&
    session.data?.user?.role !== Role.JUDGE
  ) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <Header title="Results" subtitle="" />
        <p className="text-center text-xl mt-8">No permission.</p>
      </main>
    );
  }

  const scoreMap = new Map(
    (myScores ?? []).map((s) => [s.taskId, s]),
  );

  const checklist = (myInspection?.checklist ?? {}) as Record<string, boolean>;
  const checkedCount = ALL_INSPECTION_KEYS.filter((k) => checklist[k]).length;
  const inspectionPassed = myInspection?.passed ?? false;

  let grandTotal = 0;
  let maxTotal = 0;
  for (const task of TASKS) {
    const saved = scoreMap.get(task.id);
    if (saved) grandTotal += saved.totalScore;
    maxTotal += task.maxScore;
  }

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="Results" subtitle="RoboCup@Home 2026" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-12">
        {/* Inspection */}
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Robot Inspection</h3>
              <p className="text-sm text-gray-400">
                {checkedCount}/{ALL_INSPECTION_KEYS.length} items checked
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                inspectionPassed
                  ? "bg-emerald-400/20 text-emerald-400"
                  : "bg-yellow-400/20 text-yellow-400"
              }`}
            >
              {inspectionPassed ? "PASS" : "NOT READY"}
            </span>
          </div>
        </div>

        {/* Summary Table */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="text-left p-3 text-gray-400">Task</th>
                <th className="text-right p-3 text-gray-400">My Score</th>
                <th className="text-right p-3 text-gray-400">Max</th>
                <th className="text-right p-3 text-gray-400">%</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((task) => {
                const saved = scoreMap.get(task.id);
                const score = saved?.totalScore ?? 0;
                const pct = task.maxScore > 0 ? Math.round((score / task.maxScore) * 100) : 0;
                return (
                  <tr key={task.id} className="border-b border-gray-700/50">
                    <td className="p-3 text-white">{task.name}</td>
                    <td
                      className={`p-3 text-right font-mono ${
                        score > 0
                          ? "text-emerald-400"
                          : score < 0
                            ? "text-red-400"
                            : "text-gray-500"
                      }`}
                    >
                      {saved ? score : "—"}
                    </td>
                    <td className="p-3 text-right text-gray-400 font-mono">
                      {task.maxScore}
                    </td>
                    <td className="p-3 text-right text-gray-400 font-mono">
                      {saved ? `${pct}%` : "—"}
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-gray-800/50 font-bold">
                <td className="p-3 text-white">Total</td>
                <td
                  className={`p-3 text-right font-mono ${
                    grandTotal >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {grandTotal}
                </td>
                <td className="p-3 text-right text-gray-400 font-mono">
                  {maxTotal}
                </td>
                <td className="p-3 text-right text-gray-400 font-mono">
                  {maxTotal > 0 ? `${Math.round((grandTotal / maxTotal) * 100)}%` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Per-task breakdown of non-zero items */}
        {TASKS.map((task) => {
          const saved = scoreMap.get(task.id);
          if (!saved) return null;
          const data = saved.scoreData as Record<string, unknown>;
          const taskDef = TASK_MAP.get(task.id);
          if (!taskDef) return null;

          const nonZeroItems: { label: string; value: number }[] = [];
          for (const section of taskDef.sections) {
            for (const item of section.items) {
              if (task.id === "finals" && item.key.startsWith("custom_")) {
                const pts = data[`${item.key}_points`];
                const name = data[`${item.key}_name`];
                if (typeof pts === "number" && pts !== 0) {
                  nonZeroItems.push({
                    label: (name as string) || item.label,
                    value: pts,
                  });
                }
                continue;
              }
              const val = data[item.key];
              if (item.type === "checkbox" && val === true) {
                nonZeroItems.push({ label: item.label, value: item.points });
              } else if (
                item.type === "stepper" &&
                typeof val === "number" &&
                val > 0
              ) {
                nonZeroItems.push({
                  label: `${item.label} (×${val})`,
                  value: val * item.points,
                });
              }
            }
          }

          if (nonZeroItems.length === 0) return null;

          return (
            <div key={task.id} className="mb-6">
              <h3 className="text-sm font-bold text-roboblue mb-2">
                {task.name} — {saved.totalScore} pts
              </h3>
              <div className="space-y-1">
                {nonZeroItems.map((ni, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs rounded px-2 py-1 bg-gray-900/50"
                  >
                    <span className="text-gray-300">{ni.label}</span>
                    <span
                      className={`font-mono ${
                        ni.value >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {ni.value >= 0 ? "+" : ""}
                      {ni.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button
            variant="destructive"
            onClick={() => setShowReset(true)}
          >
            Start New Run
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700"
            onClick={() => router.push("/athome")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showReset}
        onOpenChange={setShowReset}
        title="Start New Run?"
        description="This will permanently delete all your saved scores and inspection data. This action cannot be undone."
        confirmLabel="Reset Everything"
        destructive
        onConfirm={() => resetMutation.mutate()}
      />
    </main>
  );
}
