"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { api } from "~/trpc/react";
import { useScoringSession } from "rbrgs/lib/scoring-session-context";
import { TASKS } from "rbrgs/lib/athome-tasks";

export default function SessionsPage() {
  const session = useSession();
  const router = useRouter();
  const { activeSessionId, setActiveSession } = useScoringSession();

  const { data: sessions, isLoading } = api.athome.getMySessions.useQuery(
    undefined,
    { enabled: session.status === "authenticated" },
  );

  // Auth guard
  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Sign in to view your sessions.</p>
        <Button onClick={() => signIn("google")} className="bg-roboblue">
          Sign in with Google
        </Button>
      </main>
    );
  }

  if (session.status === "loading" || isLoading) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </main>
    );
  }

  const allSessions = sessions ?? [];

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="My Sessions" subtitle="Session History" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-12">
        {allSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400 mb-4">No sessions yet.</p>
            <Button
              onClick={() => router.push("/athome")}
              className="bg-roboblue hover:bg-blue-600"
            >
              Start Your First Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {allSessions.map((s) => {
              const total = s.scores.reduce(
                (sum, sc) => sum + sc.totalScore,
                0,
              );
              const tasksScored = s.scores.length;
              const inspPassed = s.inspections[0]?.passed ?? null;
              const isActive = s.id === activeSessionId;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSession({ id: s.id, label: s.label });
                    router.push("/athome");
                  }}
                  className={`w-full rounded-xl border p-5 text-left transition-all hover:shadow-lg ${
                    isActive
                      ? "border-roboblue bg-roboblue/10 shadow-roboblue/10"
                      : "border-gray-700 bg-gray-900/50 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">
                          {s.label ?? "Untitled Session"}
                        </h3>
                        {isActive && (
                          <span className="rounded-full bg-roboblue/20 px-2 py-0.5 text-xs font-semibold text-roboblue whitespace-nowrap">
                            Active
                          </span>
                        )}
                        {s.finishedAt && !isActive && (
                          <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-gray-400 whitespace-nowrap">
                            Finished
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(s.startedAt).toLocaleString()}
                        {s.finishedAt && (
                          <> — Finished {new Date(s.finishedAt).toLocaleString()}</>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3 text-right shrink-0">
                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="font-mono font-bold text-emerald-400">
                          {total}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tasks</p>
                        <p className="font-mono text-white">
                          {tasksScored}/{TASKS.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Insp.</p>
                        <p
                          className={`font-mono text-sm font-bold ${
                            inspPassed === true
                              ? "text-emerald-400"
                              : inspPassed === false
                                ? "text-yellow-400"
                                : "text-gray-600"
                          }`}
                        >
                          {inspPassed === true
                            ? "PASS"
                            : inspPassed === false
                              ? "FAIL"
                              : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task breakdown pills */}
                  {s.scores.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.scores.map((sc) => {
                        const taskDef = TASKS.find((t) => t.id === sc.taskId);
                        return (
                          <span
                            key={sc.taskId}
                            className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                          >
                            {taskDef
                              ? taskDef.name.length > 15
                                ? taskDef.name.slice(0, 15) + "…"
                                : taskDef.name
                              : sc.taskId}
                            : {sc.totalScore}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Back */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/athome")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
