"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ActiveSession {
  id: string;
  label: string | null;
}

interface SessionContextValue {
  activeSessionId: string | null;
  activeSessionLabel: string | null;
  setActiveSession: (session: ActiveSession | null) => void;
  clearActiveSession: () => void;
}

const ScoringSessionContext = createContext<SessionContextValue>({
  activeSessionId: null,
  activeSessionLabel: null,
  setActiveSession: () => {},
  clearActiveSession: () => {},
});

const STORAGE_KEY = "athome_active_session";

export function ScoringSessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSessionState] = useState<ActiveSession | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActiveSession;
        if (parsed.id) {
          setActiveSessionState(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setActiveSession = useCallback((session: ActiveSession | null) => {
    setActiveSessionState(session);
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearActiveSession = useCallback(() => {
    setActiveSessionState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ScoringSessionContext.Provider
      value={{
        activeSessionId: activeSession?.id ?? null,
        activeSessionLabel: activeSession?.label ?? null,
        setActiveSession,
        clearActiveSession,
      }}
    >
      {children}
    </ScoringSessionContext.Provider>
  );
}

export function useScoringSession() {
  return useContext(ScoringSessionContext);
}
