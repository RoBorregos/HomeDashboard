"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { Checkbox } from "rbrgs/app/_components/shadcn/ui/checkbox";
import { Stepper } from "rbrgs/app/_components/athome/Stepper";
import { api } from "~/trpc/react";
import { TASK_MAP, computeTotal, type TaskDefinition } from "rbrgs/lib/athome-tasks";

export default function TaskScorePage() {
  const session = useSession();
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const task = TASK_MAP.get(taskId);

  const { data: myScores, isLoading } = api.athome.scoreGetMine.useQuery(
    undefined,
    { enabled: !!session.data?.user },
  );

  const [scoreData, setScoreData] = useState<Record<string, unknown>>({});
  const [initialized, setInitialized] = useState(false);

  // Custom task state for finals
  const [customTasks, setCustomTasks] = useState<
    { name: string; points: number }[]
  >([
    { name: "", points: 0 },
    { name: "", points: 0 },
    { name: "", points: 0 },
  ]);

  // Pre-fill from DB
  useEffect(() => {
    if (!task || initialized) return;
    const existing = myScores?.find((s) => s.taskId === taskId);
    if (existing) {
      const data = existing.scoreData as Record<string, unknown>;
      setScoreData(data);
      // Restore custom tasks for finals
      if (taskId === "finals") {
        setCustomTasks([
          {
            name: (data.custom_1_name as string) ?? "",
            points: (data.custom_1_points as number) ?? 0,
          },
          {
            name: (data.custom_2_name as string) ?? "",
            points: (data.custom_2_points as number) ?? 0,
          },
          {
            name: (data.custom_3_name as string) ?? "",
            points: (data.custom_3_points as number) ?? 0,
          },
        ]);
      }
      setInitialized(true);
    } else if (!isLoading) {
      setInitialized(true);
    }
  }, [myScores, isLoading, task, taskId, initialized]);

  const updateField = useCallback((key: string, value: unknown) => {
    setScoreData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Build full scoreData including custom tasks
  const fullScoreData = useMemo(() => {
    if (taskId !== "finals") return scoreData;
    const data = { ...scoreData };
    customTasks.forEach((ct, i) => {
      const key = `custom_${i + 1}`;
      data[`${key}_name`] = ct.name;
      data[`${key}_points`] = ct.points;
    });
    return data;
  }, [scoreData, customTasks, taskId]);

  const total = useMemo(
    () => computeTotal(taskId, fullScoreData),
    [taskId, fullScoreData],
  );

  const saveMutation = api.athome.scoreSave.useMutation({
    onSuccess() {
      toast("Score saved!");
      router.push("/athome");
    },
    onError(err) {
      toast("Error saving score");
      console.error(err);
    },
  });

  if (
    session.data?.user?.role !== Role.ADMIN &&
    session.data?.user?.role !== Role.JUDGE
  ) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <Header title="Score" subtitle="" />
        <p className="text-center text-xl mt-8">No permission.</p>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="mt-[4rem] min-h-screen bg-black text-white">
        <Header title="Unknown Task" subtitle="" />
        <p className="text-center text-xl mt-8">Task &quot;{taskId}&quot; not found.</p>
      </main>
    );
  }

  const handleSave = () => {
    saveMutation.mutate({
      taskId,
      scoreData: fullScoreData,
      totalScore: total,
    });
  };

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title={task.name} subtitle={`⏱ ${task.timeLimit} · Max ${task.maxScore} pts`} />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-12">
        {/* Live total */}
        <div className="mb-6 text-center sticky top-[4rem] z-10 bg-black/90 backdrop-blur py-3 rounded-b-xl border-b border-gray-700">
          <span className="text-sm text-gray-400">Running Total</span>
          <p
            className={`text-4xl font-bold ${
              total < 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {total}
          </p>
        </div>

        {/* Sections */}
        {task.sections.map((section) => {
          // Skip custom tasks section — handled separately
          if (taskId === "finals" && section.title === "Custom Tasks") return null;

          return (
            <div key={section.title} className="mb-8">
              <h2 className="mb-3 text-lg font-bold text-roboblue border-b border-gray-700 pb-2">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  if (item.type === "checkbox") {
                    const checked = !!scoreData[item.key];
                    return (
                      <label
                        key={item.key}
                        className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-900/50 p-3 cursor-pointer hover:border-gray-500 transition-colors"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            updateField(item.key, !checked)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-200 leading-tight">
                            {item.label}
                          </span>
                          <p
                            className={`text-xs font-mono mt-0.5 ${
                              item.points >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {item.points >= 0 ? "+" : ""}
                            {item.points} pts
                          </p>
                        </div>
                      </label>
                    );
                  }

                  // Stepper
                  return (
                    <Stepper
                      key={item.key}
                      value={(scoreData[item.key] as number) ?? 0}
                      onChange={(v) => updateField(item.key, v)}
                      max={item.max ?? 1}
                      label={item.label}
                      points={item.points}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Custom Tasks (Finals only) */}
        {taskId === "finals" && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-roboblue border-b border-gray-700 pb-2">
              Custom Tasks
            </h2>
            <div className="space-y-3">
              {customTasks.map((ct, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row gap-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3"
                >
                  <input
                    type="text"
                    placeholder={`Custom task ${i + 1} name`}
                    value={ct.name}
                    onChange={(e) => {
                      const newTasks = [...customTasks];
                      newTasks[i] = { ...newTasks[i]!, name: e.target.value };
                      setCustomTasks(newTasks);
                    }}
                    className="flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-roboblue"
                  />
                  <input
                    type="number"
                    placeholder="Points"
                    value={ct.points || ""}
                    onChange={(e) => {
                      const newTasks = [...customTasks];
                      newTasks[i] = {
                        ...newTasks[i]!,
                        points: parseInt(e.target.value) || 0,
                      };
                      setCustomTasks(newTasks);
                    }}
                    className="w-24 rounded border border-gray-600 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-roboblue"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full max-w-xs"
          >
            {saveMutation.isPending ? "Saving..." : "Save & Finish"}
          </Button>
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
