import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { TournamentState } from "../../domain/tournament/types";
import { loadTournamentState, saveTournamentState } from "../../domain/tournament/storage";
import { buildDefaultTournamentState } from "../../domain/tournament/schedule";
import { tournamentReducer, type TournamentAction } from "../../domain/tournament/reducer";
import { useLocalStorageEffect } from "../../hooks/useLocalStorageState";

type TournamentContextValue = {
    state: TournamentState;
    dispatch: React.Dispatch<TournamentAction>;
};

const TournamentContext = createContext<TournamentContextValue | null>(null);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
    const initial = useMemo(() => loadTournamentState() ?? buildDefaultTournamentState(), []);
    const [state, dispatch] = useReducer(tournamentReducer, initial);

    useLocalStorageEffect(state, saveTournamentState);

    const value = useMemo(() => ({ state, dispatch }), [state]);
    return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>;
}

export function useTournament() {
    const ctx = useContext(TournamentContext);
    if (!ctx) throw new Error("useTournament must be used within TournamentProvider");
    return ctx;
}
