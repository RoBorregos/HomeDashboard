"use client";

import Header from "rbrgs/app/_components/header";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "rbrgs/app/_components/shadcn/ui/checkbox";
import { Button } from "~/app/_components/shadcn/ui/button";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import { ALL_INSPECTION_KEYS, INSPECTION_SECTIONS } from "rbrgs/lib/athome-tasks";

export default function InspectionPage() {
  const router = useRouter();
  const session = useSession();

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allPassed = ALL_INSPECTION_KEYS.every((k) => !!checklist[k]);

  const saveMutation = api.athome.inspectionSave.useMutation({
    onSuccess: (data) => {
      // Record this save in the current browser session
      const current = JSON.parse(sessionStorage.getItem("athome_session_scores") ?? "[]") as string[];
      current.push(data.id);
      sessionStorage.setItem("athome_session_scores", JSON.stringify(current));

      router.push("/athome");
      router.refresh();
    },
  });

  if (session.status === "unauthenticated") {
    return (
      <main className="mt-[4rem] flex min-h-screen flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-white/50">Login required for inspection.</p>
        <Button onClick={() => signIn("google")}>Sign in</Button>
      </main>
    );
  }

  return (
    <main className="mt-[4rem] min-h-screen bg-black text-white">
      <div className="md:pb-20">
        <Header title="Inspection" subtitle="Security & Robot Requirements" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-20">
        {INSPECTION_SECTIONS.map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-white">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div 
                  key={item.key} 
                  className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={item.key}
                      checked={!!checklist[item.key]}
                      onCheckedChange={() => toggleItem(item.key)}
                    />
                    <label htmlFor={item.key} className="text-sm cursor-pointer">{item.label}</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 flex justify-center gap-4">
          <Button 
            onClick={() => saveMutation.mutate({ checklist, passed: allPassed })}
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
