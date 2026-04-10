"use client";

import { useSession } from "next-auth/react";
import Header from "rbrgs/app/_components/header";
import { api } from "~/trpc/react";
import { TASK_MAP } from "rbrgs/lib/athome-tasks";

export default function ResultsPage() {
  const session = useSession();

  const { data: myHistory, isLoading } = api.athome.scoreGetMine.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
           <Header title="Results" subtitle="Login Required" />
           <p className="text-white/50 mt-4">Please log in to see your personal history.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-12">
        <Header title="My History" subtitle="Full Record of All Attempts" />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        {isLoading ? (
          <div className="animate-pulse text-center text-gray-500">Loading your recordings...</div>
        ) : (
          <div className="space-y-4">
            {myHistory?.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                 <p className="text-gray-500 italic">No recordings found yet.</p>
              </div>
            )}
            
            {myHistory?.map((record) => {
              const task = TASK_MAP.get(record.taskId);
              return (
                <div
                  key={record.id}
                  className="group rounded-xl border border-gray-700 bg-gray-900/50 p-6 transition-all hover:bg-white/5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white  tracking-tight">{task?.name ?? record.taskId}</h3>
                        <p className="text-[10px] text-gray-500 tracking-widest font-bold mt-1">
                          SAVED AT: {new Date(record.savedAt).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest mb-1">Score</p>
                        <p className="text-4xl font-bold text-emerald-400 font-mono">{record.totalScore}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                     <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-500 font-mono">
                       RECORD ID: {record.id.slice(-8)}
                     </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
