"use client";

import { useSession } from "next-auth/react";
import Header from "rbrgs/app/_components/header";
import { api } from "~/trpc/react";
import { TASKS } from "rbrgs/lib/athome-tasks";

export default function ResultsPage() {
  const session = useSession();

  const { data: myHistory, isLoading } = api.athome.getMyHistory.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const { data: bestScores } = api.athome.scoreGetBestPerTask.useQuery();

  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
           <Header title="Results" subtitle="Login Required" />
           <p className="text-white/50 mt-4">Please log in to see your results.</p>
        </div>
      </main>
    );
  }

  const latestPerTask = new Map<string, typeof myHistory[number]>();
  myHistory?.forEach(s => {
    if (!latestPerTask.has(s.taskId)) latestPerTask.set(s.taskId, s);
  });

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-12">
        <Header title="My Results" subtitle="Personal Scoring Summary" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        <div className="grid gap-4">
          {TASKS.map((task) => {
            const myBest = latestPerTask.get(task.id);
            const globalBest = bestScores?.[task.id];

            return (
              <div
                key={task.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{task.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                      Max Score: {task.maxScore} pts
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mb-1">Your Best</p>
                      <p className="text-3xl font-bold text-white">{myBest?.totalScore ?? '—'}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mb-1">Global Record</p>
                      <p className="text-3xl font-bold text-white/60">{globalBest ?? '—'}</p>
                    </div>
                  </div>
                </div>

                {myBest && (
                   <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <p className="text-[10px] text-white/20 uppercase font-mono">Last updated: {new Date(myBest.savedAt).toLocaleString()}</p>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
