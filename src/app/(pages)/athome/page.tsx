"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import Link from "next/link";
import Header from "rbrgs/app/_components/header";
import { api } from "~/trpc/react";
import { TASKS, INSPECTION_SECTIONS, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function AtHomeDashboard() {
  const session = useSession();

  const { data: myScores } = api.athome.scoreGetMine.useQuery(undefined, {
    enabled: !!session.data?.user,
  });
  const { data: bestPerTask } = api.athome.scoreGetBestPerTask.useQuery(undefined, {
    enabled: !!session.data?.user,
  });
  const { data: myInspection } = api.athome.inspectionGetMine.useQuery(undefined, {
    enabled: !!session.data?.user,
  });

  if (
    session.data?.user?.role !== Role.ADMIN &&
    session.data?.user?.role !== Role.JUDGE
  ) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <div className="md:pb-20">
          <Header title="@Home" subtitle="" />
        </div>
        <div className="p-2">
          <h1 className="mb-5 text-center text-4xl">
            You don&apos;t have permission to access this page.
          </h1>
        </div>
      </main>
    );
  }

  const myScoreMap = new Map(
    (myScores ?? []).map((s) => [s.taskId, s]),
  );

  const tasksCompleted = TASKS.filter((t) => myScoreMap.has(t.id)).length;
  const totalBestScore = Object.values(bestPerTask ?? {}).reduce(
    (sum: number, v) => sum + (v as number),
    0,
  );

  const checklist = (myInspection?.checklist ?? {}) as Record<string, boolean>;
  const checkedCount = ALL_INSPECTION_KEYS.filter((k) => checklist[k]).length;
  const inspectionPassed = myInspection?.passed ?? false;

  const isAdmin = session.data?.user?.role === Role.ADMIN;

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="@Home" subtitle="RoboCup@Home 2026" />
      </div>

      {/* Banner */}
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-xl border border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-roboblue">Roborregos</h2>
              <p className="text-sm text-gray-400">
                RoboCup@Home 2026 &middot; Judge: {session.data?.user?.name ?? "—"}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="rounded-lg bg-gray-800 px-4 py-2 text-center">
                <p className="text-xs text-gray-400">Best Total</p>
                <p className="text-xl font-bold text-emerald-400">{totalBestScore}</p>
              </div>
              <div className="rounded-lg bg-gray-800 px-4 py-2 text-center">
                <p className="text-xs text-gray-400">Tasks Scored</p>
                <p className="text-xl font-bold text-white">{tasksCompleted}/6</p>
              </div>
              <div className="rounded-lg bg-gray-800 px-4 py-2 text-center">
                <p className="text-xs text-gray-400">Inspection</p>
                <p
                  className={`text-xl font-bold ${
                    inspectionPassed ? "text-emerald-400" : "text-yellow-400"
                  }`}
                >
                  {inspectionPassed ? "PASS" : "NOT READY"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mx-auto max-w-5xl px-4 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Inspection Card */}
          <Link href="/athome/inspection">
            <div className="group cursor-pointer rounded-xl border border-gray-700 bg-gray-900/50 p-5 transition-all hover:border-roboblue hover:shadow-lg hover:shadow-roboblue/10">
              <div className="flex items-center justify-between">
                <div className="text-2xl">🛡️</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    inspectionPassed
                      ? "bg-emerald-400/20 text-emerald-400"
                      : "bg-yellow-400/20 text-yellow-400"
                  }`}
                >
                  {inspectionPassed ? "PASS" : "NOT READY"}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">
                Robot Inspection
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {checkedCount}/{ALL_INSPECTION_KEYS.length} checked &middot; Pass/Fail
              </p>
            </div>
          </Link>

          {/* Task Cards */}
          {TASKS.map((task) => {
            const saved = myScoreMap.get(task.id);
            const best = (bestPerTask ?? {})[task.id] as number | undefined;
            return (
              <Link key={task.id} href={`/athome/${task.id}`}>
                <div className="group cursor-pointer rounded-xl border border-gray-700 bg-gray-900/50 p-5 transition-all hover:border-roboblue hover:shadow-lg hover:shadow-roboblue/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">
                      ⏱ {task.timeLimit}
                    </span>
                    {saved && (
                      <span className="text-emerald-400 text-lg">✓</span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {task.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Max: {task.maxScore} pts
                  </p>
                  {saved && (
                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      My score: {saved.totalScore}
                    </p>
                  )}
                  {best !== undefined && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      Best: {best}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link
            href="/athome/results"
            className="rounded-lg border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            View Results
          </Link>
          {isAdmin && (
            <Link
              href="/athome/admin"
              className="rounded-lg border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
