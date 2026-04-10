"use client";

import { SessionProvider } from "next-auth/react";
import { ScoringSessionProvider } from "rbrgs/lib/scoring-session-context";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ScoringSessionProvider>
        {children}
      </ScoringSessionProvider>
    </SessionProvider>
  );
}
