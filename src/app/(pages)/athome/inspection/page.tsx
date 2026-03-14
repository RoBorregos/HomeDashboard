"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import Header from "rbrgs/app/_components/header";
import { Button } from "~/app/_components/shadcn/ui/button";
import { Checkbox } from "rbrgs/app/_components/shadcn/ui/checkbox";
import { api } from "~/trpc/react";
import { INSPECTION_SECTIONS, ALL_INSPECTION_KEYS } from "rbrgs/lib/athome-tasks";

export default function InspectionPage() {
  const session = useSession();
  const router = useRouter();

  const { data: existing, isLoading } = api.athome.inspectionGetMine.useQuery(
    undefined,
    { enabled: !!session.data?.user },
  );

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  // Pre-fill from DB
  useEffect(() => {
    if (existing && !initialized) {
      const saved = (existing.checklist ?? {}) as Record<string, boolean>;
      setChecklist(saved);
      setInitialized(true);
    } else if (!existing && !isLoading && !initialized) {
      // Initialize all keys to false
      const init: Record<string, boolean> = {};
      for (const k of ALL_INSPECTION_KEYS) init[k] = false;
      setChecklist(init);
      setInitialized(true);
    }
  }, [existing, isLoading, initialized]);

  const checkedCount = useMemo(
    () => ALL_INSPECTION_KEYS.filter((k) => checklist[k]).length,
    [checklist],
  );

  const passed = checkedCount === ALL_INSPECTION_KEYS.length;

  const saveMutation = api.athome.inspectionSave.useMutation({
    onSuccess() {
      toast("Inspection saved!");
      router.push("/athome");
    },
    onError(err) {
      toast("Error saving inspection");
      console.error(err);
    },
  });

  const toggleItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // No role checks - page is public

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="Robot Inspection" subtitle="RoboCup@Home 2026" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-12">
        {/* Counter */}
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold">
            {checkedCount}/{ALL_INSPECTION_KEYS.length}
          </span>
          <span className="ml-2 text-gray-400">checked</span>
        </div>

        {/* Sections */}
        {INSPECTION_SECTIONS.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-roboblue border-b border-gray-700 pb-2">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-900/50 p-3 cursor-pointer hover:border-gray-500 transition-colors"
                >
                  <Checkbox
                    checked={!!checklist[item.key]}
                    onCheckedChange={() => toggleItem(item.key)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-200 leading-tight">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <span
            className={`rounded-full px-6 py-2 text-lg font-bold ${
              passed
                ? "bg-emerald-400/20 text-emerald-400"
                : "bg-yellow-400/20 text-yellow-400"
            }`}
          >
            {passed ? "✓ PASS" : "NOT READY"}
          </span>

          <Button
            onClick={() => saveMutation.mutate({ checklist, passed })}
            disabled={saveMutation.isPending}
            className="w-full max-w-xs"
          >
            {saveMutation.isPending ? "Saving..." : "Save Inspection"}
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
