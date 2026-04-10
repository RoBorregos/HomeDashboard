"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { api } from "~/trpc/react";
import { useScoringSession } from "rbrgs/lib/scoring-session-context";
import { TASKS, INSPECTION_SECTIONS, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function AtHomeDashboard() {
  const session = useSession();
  const { activeSessionId, activeSessionLabel, setActiveSession } = useScoringSession();
  const [newLabel, setNewLabel] = useState("");

  const { data: mySessions, refetch: refetchSessions } =
    api.athome.getMySessions.useQuery(undefined, {
      enabled: session.status === "authenticated",
    });

  const { data: sessionScores } = api.athome.scoreGetBySession.useQuery(
    { sessionId: activeSessionId! },
    { enabled: !!activeSessionId },
  );

  const { data: bestPerTask } = api.athome.scoreGetBestPerTask.useQuery(
    undefined,
    { enabled: session.status === "authenticated" },
  );

  const { data: sessionInspection } = api.athome.inspectionGetBySession.useQuery(
    { sessionId: activeSessionId! },
    { enabled: !!activeSessionId },
  );

  const createSessionMutation = api.athome.createSession.useMutation({
    onSuccess(data) {
      setActiveSession({ id: data.id, label: data.label });
      setNewLabel("");
      void refetchSessions();
    },
  });

  // ── Not signed in ────────────────────────────────────────────
  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <div className="md:pb-20">
          <Header title="@Home" subtitle="RoboCup@Home 2026" />
        </div>
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 p-10">
            <h2 className="mb-2 text-2xl font-bold text-white">Welcome, Judge</h2>
            <p className="mb-8 text-sm text-gray-400">
              Sign in with your Google account to start scoring.
            </p>
            <Button
              onClick={() => signIn("google")}
              className="w-full bg-roboblue hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-roboblue/20"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
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

  // ── No active session → session picker ─────────────────────────
  if (!activeSessionId) {
    const openSessions = (mySessions ?? []).filter((s) => !s.finishedAt);
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <div className="md:pb-20">
          <Header title="@Home" subtitle="RoboCup@Home 2026" />
        </div>
        <div className="mx-auto max-w-lg px-4">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-b from-gray-900 to-gray-950 p-8">
            <h2 className="mb-1 text-xl font-bold text-white">
              Hi, {session.data?.user?.name ?? "Judge"} 👋
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              Start a new scoring session or resume an existing one.
            </p>

            {/* New Session */}
            <div className="mb-6">
              <label className="mb-1 block text-xs text-gray-400">
                New Session Label (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Run 1, Practice..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-roboblue transition-colors"
                />
                <Button
                  onClick={() =>
                    createSessionMutation.mutate({
                      label: newLabel || undefined,
                    })
                  }
                  disabled={createSessionMutation.isPending}
                  className="bg-roboblue hover:bg-blue-600 whitespace-nowrap"
                >
                  {createSessionMutation.isPending ? "Creating..." : "New Session"}
                </Button>
              </div>
            </div>

            {/* Resume open sessions */}
            {openSessions.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Resume Session
                </p>
                <div className="space-y-2">
                  {openSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        setActiveSession({ id: s.id, label: s.label })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-left transition-all hover:border-roboblue hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">
                          {s.label ?? "Untitled Session"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {s.scores.length} tasks
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Started{" "}
                        {new Date(s.startedAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link to see all sessions */}
            <div className="mt-6 text-center">
              <Link
                href="/athome/sessions"
                className="text-sm text-gray-400 hover:text-roboblue transition-colors"
              >
                View all sessions →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Active session → dashboard ─────────────────────────────────

  const myScoreMap = new Map(
    (sessionScores ?? []).map((s) => [s.taskId, s]),
  );

  const tasksCompleted = TASKS.filter((t) => myScoreMap.has(t.id)).length;
  const totalBestScore = Object.values(bestPerTask ?? {}).reduce(
    (sum: number, v) => sum + v,
    0,
  );
  const sessionTotal = (sessionScores ?? []).reduce(
    (sum, s) => sum + s.totalScore,
    0,
  );

  const checklist = (sessionInspection?.checklist ?? {}) as Record<string, boolean>;
  const checkedCount = ALL_INSPECTION_KEYS.filter((k) => checklist[k]).length;
  const inspectionPassed = sessionInspection?.passed ?? false;

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
              <h2 className="text-2xl font-bold text-roboblue">
                {session.data?.user?.name ?? "Judge"}
              </h2>
              <p className="text-sm text-gray-400">
                Session: {activeSessionLabel ?? "Untitled"} &middot;{" "}
                <button
                  onClick={() => setActiveSession(null)}
                  className="text-roboblue hover:underline"
                >
                  Switch
                </button>
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="rounded-lg bg-gray-800 px-4 py-2 text-center">
                <p className="text-xs text-gray-400">Session Total</p>
                <p className="text-xl font-bold text-emerald-400">{sessionTotal}</p>
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
            const best = bestPerTask?.[task.id];
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
          <Link
            href="/athome/sessions"
            className="rounded-lg border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            All Sessions
          </Link>
          <Link
            href="/athome/admin"
            className="rounded-lg border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
