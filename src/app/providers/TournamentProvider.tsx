import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { TournamentState } from "../../domain/tournament/types";
import { buildDefaultTournamentState } from "../../domain/tournament/schedule";
import { tournamentReducer, type TournamentAction } from "../../domain/tournament/reducer";
import { createTournament, loadTournament, saveTournament } from "../../infra/tournamentRepo";
import { getTournamentIdFromUrl, setTournamentIdInUrl } from "../../infra/tournamentId";
import { useAdmin } from "./AdminProvider";

type TournamentContextValue = {
    state: TournamentState;
    dispatch: React.Dispatch<TournamentAction>;
    tournamentId: string | null;
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

function useDebouncedSave(ms: number) {
    const timer = useRef<number | null>(null);
    const latest = useRef<(() => void) | null>(null);

    const schedule = (fn: () => void) => {
        latest.current = fn;
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            latest.current?.();
        }, ms);
    };

    // optional cleanup
    useEffect(() => {
        return () => {
            if (timer.current) window.clearTimeout(timer.current);
        };
    }, []);

    return schedule;
}

export function TournamentProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(tournamentReducer, buildDefaultTournamentState());
    const [tournamentId, setTournamentId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { isAdmin, adminPin } = useAdmin();

    // Initial load (or create)
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);

            try {
                let id = getTournamentIdFromUrl();

                if (!id) {
                    const initial = buildDefaultTournamentState();
                    id = await createTournament(initial);
                    setTournamentIdInUrl(id);
                }

                setTournamentId(id);

                const remote = await loadTournament(id);
                dispatch({ type: "tournament/reset", next: normalizeState(remote) });
            } catch (e: any) {
                setError(e?.message ?? "Failed to load tournament");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Debounced remote saves (admin only)
    const debounce = useDebouncedSave(700);
    const lastSavedJson = useRef<string>("");

    useEffect(() => {
        if (!tournamentId) return;
        if (!isAdmin) return;
        if (!adminPin) return;

        // Don't save while initial load is happening
        if (loading) return;

        // Avoid hammering save if nothing actually changed
        const json = JSON.stringify(state);
        if (json === lastSavedJson.current) return;

        debounce(() => {
            saveTournament(tournamentId, state, adminPin)
                .then(() => {
                    lastSavedJson.current = json;
                })
                .catch((err) => {
                    // keep UI alive; surface a message
                    console.error(err);
                    setError(typeof err?.message === "string" ? err.message : "Failed to save");
                });
        });
    }, [state, tournamentId, isAdmin, adminPin, loading, debounce]);

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

    // Optional: show a simple loading / error UI wrapper
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
                    <div className="muted">
                        If this is a new deployment, ensure your Supabase env vars are set and the Edge Functions are deployed.
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
