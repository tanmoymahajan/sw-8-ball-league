// src/app/providers/TournamentProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { TournamentState } from "../../domain/tournament/types";
import { buildDefaultTournamentState } from "../../domain/tournament/schedule";
import { tournamentReducer, type TournamentAction } from "../../domain/tournament/reducer";
import { loadTournament, saveTournament } from "../../infra/tournamentRepo";
import { useAdmin } from "./AdminProvider";

const HARDCODED_TOURNAMENT_ID = "3c2c0ef0-5c32-4bd1-9fbe-7cbb2c4e6e9c"; // ✅ change if you want a different shared tournament

type TournamentContextValue = {
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
  tournamentId: string;
  loading: boolean;
  error: string | null;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

function normalizeState(raw: any): TournamentState {
  return {
    players: Array.isArray(raw?.players) ? raw.players : [],
    matches: Array.isArray(raw?.matches) ? raw.matches : [],
    knockout: Array.isArray(raw?.knockout) ? raw.knockout : [],
  };
}

function useDebounced(ms: number) {
  const timer = useRef<number | null>(null);
  const latest = useRef<(() => void) | null>(null);

  const schedule = (fn: () => void) => {
    latest.current = fn;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => latest.current?.(), ms);
  };

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return schedule;
}

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, buildDefaultTournamentState());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isAdmin, adminPin } = useAdmin();

  const tournamentId = HARDCODED_TOURNAMENT_ID;

  // Initial load from Supabase
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      try {
        const remote = await loadTournament(tournamentId);
        dispatch({ type: "tournament/reset", next: normalizeState(remote) });
      } catch (e: any) {
        // If the tournament row doesn't exist yet, show a clear message.
        // (You can create it once from SQL or add a dedicated create-by-id function.)
        setError(
          e?.message ??
            `Failed to load tournament "${tournamentId}". Ensure the row exists in Supabase table "tournaments".`
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced remote save (admin only)
  const debounce = useDebounced(700);
  const lastSavedJson = useRef<string>("");

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) return;
    if (!adminPin) return;

    const json = JSON.stringify(state);
    if (json === lastSavedJson.current) return;

    debounce(() => {
      saveTournament(tournamentId, state, adminPin)
        .then(() => {
          lastSavedJson.current = json;
        })
        .catch((err) => {
          console.error(err);
          setError(typeof err?.message === "string" ? err.message : "Failed to save tournament");
        });
    });
  }, [state, loading, isAdmin, adminPin, tournamentId, debounce]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      tournamentId,
      loading,
      error,
    }),
    [state, tournamentId, loading, error]
  );

  if (loading) {
    return (
      <TournamentContext.Provider value={value}>
        <div style={{ padding: 16 }} className="muted">
          Loading tournament…
        </div>
      </TournamentContext.Provider>
    );
  }

  if (error) {
    return (
      <TournamentContext.Provider value={value}>
        <div style={{ padding: 16 }}>
          <div className="errorText" style={{ marginBottom: 12 }}>
            {error}
          </div>

          <div className="muted" style={{ lineHeight: 1.5 }}>
            If this is the first time you are using this hardcoded tournament id, create a row in Supabase:
            <br />
              <code>
                  {`insert into tournaments (id, state) values ('${HARDCODED_TOURNAMENT_ID}', '{}'::jsonb);`}
              </code>
          </div>
        </div>
      </TournamentContext.Provider>
    );
  }

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used within TournamentProvider");
  return ctx;
}
