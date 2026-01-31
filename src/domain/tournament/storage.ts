import type { TournamentState } from "./types";
import { LS_KEY } from "./constants";

export function loadTournamentState(): TournamentState | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as TournamentState;
        if (!parsed?.players || !parsed?.matches) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function saveTournamentState(state: TournamentState): void {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
        // ignore quota errors
    }
}
