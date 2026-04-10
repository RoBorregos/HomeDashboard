"use client";

import Header from "rbrgs/app/_components/header";
import { useParams, useRouter } from "next/navigation";
import { TASK_MAP, computeTotal } from "rbrgs/lib/athome-tasks";
import { useState, useMemo } from "react";
import { Checkbox } from "rbrgs/app/_components/shadcn/ui/checkbox";
import { Stepper } from "rbrgs/app/_components/athome/Stepper";
import { Button } from "~/app/_components/shadcn/ui/button";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";

export default function TaskPage() {
  const params = useParams();
  const router = useRouter();
  const session = useSession();
  const taskId = params.taskId as string;
  const task = TASK_MAP.get(taskId);

  const [scoreData, setScoreData] = useState<Record<string, unknown>>({});

  const totalScore = useMemo(() => computeTotal(taskId, scoreData), [taskId, scoreData]);

  const saveMutation = api.athome.scoreSave.useMutation({
    onSuccess: (data) => {
      // Record this save in the current browser session
      const current = JSON.parse(sessionStorage.getItem("athome_session_scores") ?? "[]") as string[];
      current.push(data.id);
      sessionStorage.setItem("athome_session_scores", JSON.stringify(current));

      router.push("/athome");
      router.refresh();
    },
  });

  if (!task) return <div>Task not found</div>;

  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] flex min-h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-white/50">Login required to score task.</p>
        <Button onClick={() => signIn("google")}>Sign in</Button>
      </main>
    );
  }

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title={task.name} subtitle={`Max Score: ${task.maxScore} pts`} />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20">
        {/* Score Card */}
        <div className="mb-8 rounded-xl border border-gray-700 bg-gray-900/50 p-6 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest">Running Score</p>
          <h2 className="text-6xl font-bold mt-2">{totalScore}</h2>
        </div>

        {task.sections.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.key} className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 transition-all">
                  {item.type === "checkbox" ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={item.key}
                          checked={!!scoreData[item.key]}
                          onCheckedChange={(val) => setScoreData(prev => ({ ...prev, [item.key]: !!val }))}
                        />
                        <label htmlFor={item.key} className="text-sm cursor-pointer">{item.label}</label>
                      </div>
                      <span className="text-xs font-mono text-gray-500">{item.points} pts</span>
                    </div>
                  ) : (
                    <Stepper
                      value={(scoreData[item.key] as number) ?? 0}
                      onChange={(v) => setScoreData(prev => ({ ...prev, [item.key]: v }))}
                      max={item.max ?? 1}
                      label={item.label}
                      points={item.points}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 flex justify-center gap-4">
          <Button 
            onClick={() => saveMutation.mutate({ taskId, scoreData, totalScore })}
            disabled={saveMutation.isPending}
            className="w-full max-w-xs bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl"
          >
            {saveMutation.isPending ? "Saving..." : "Done"}
          </Button>
        </div>
      </div>
    </main>
  );
}
