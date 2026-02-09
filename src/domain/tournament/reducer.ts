// src/domain/tournament/reducer.ts
import type {TournamentState} from "./types";
import type {SeriesMatch, StageId} from "../knockout/types";
import {buildKnockoutBracket} from "../knockout/bracket";
import {canAddFrame, computeSeriesWinner, isValidRemaining,} from "../knockout/series";

function uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function recomputeWinners(knockout: SeriesMatch[]): SeriesMatch[] {
    return knockout.map((m) => ({
        ...m,
        winnerId: computeSeriesWinner(m.format, m.frames),
    }));
}

export type TournamentAction =
    | { type: "tournament/reset"; next: TournamentState }
    | { type: "player/addToGroup"; group: string; name: string }
    | { type: "match/setResult"; matchId: string; winnerId: string; loserRemaining: number }
    | { type: "match/clear"; matchId: string }
    | { type: "knockout/initFromStandings" }
    | { type: "knockout/addFrame"; matchId: StageId; winnerId: string; loserRemaining: number }
    | { type: "knockout/removeFrame"; matchId: StageId; frameIndex: number }
    | { type: "knockout/clearMatch"; matchId: StageId }
    | { type: "knockout/setTiebreakWinner"; matchId: StageId; winnerId: string }
    | { type: "knockout/clearTiebreak"; matchId: StageId };

export function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
    switch (action.type) {
        case "tournament/reset": {
            // Ensure knockout always exists (even if caller forgets)
            return {
                players: action.next.players,
                matches: action.next.matches,
                knockout: Array.isArray(action.next.knockout) ? action.next.knockout : [],
            };
        }

        case "player/addToGroup": {
            const group = action.group as any;
            const name = action.name.trim();
            if (!name) return state;

            const newPlayerId = uid(`p${group}`);
            const newPlayer = { id: newPlayerId, group, name };

            const groupPlayers = state.players.filter((p) => p.group === group);

            // Create missing RR matches between new player and existing players in group
            const newMatches = groupPlayers.map((p) => ({
                id: uid(`m${group}`),
                group,
                p1Id: p.id,
                p2Id: newPlayerId,
                winnerId: null,
                loserRemaining: null,
                completed: false,
                updatedAt: new Date().toISOString(),
            }));

            return {
                ...state,
                players: [...state.players, newPlayer],
                matches: [...state.matches, ...newMatches],
            };
        }

        case "match/setResult": {
            if (!isValidRemaining(action.loserRemaining)) return state;

            return {
                ...state,
                matches: state.matches.map((m) =>
                    m.id === action.matchId
                        ? {
                            ...m,
                            winnerId: action.winnerId,
                            loserRemaining: action.loserRemaining,
                            completed: true,
                            updatedAt: new Date().toISOString(),
                        }
                        : m
                ),
            };
        }

        case "match/clear": {
            return {
                ...state,
                matches: state.matches.map((m) =>
                    m.id === action.matchId
                        ? {
                            ...m,
                            winnerId: null,
                            loserRemaining: null,
                            completed: false,
                            updatedAt: new Date().toISOString(),
                        }
                        : m
                ),
            };
        }

        case "knockout/initFromStandings": {
            const ko = buildKnockoutBracket(state.players, state.matches);
            return { ...state, knockout: recomputeWinners(ko) };
        }

        case "knockout/addFrame": {
            if (!isValidRemaining(action.loserRemaining)) return state;

            const ko = state.knockout.map((m) => {
                if (m.id !== action.matchId) return m;

                if (!canAddFrame(m.format, m.frames)) return m;

                const nextFrames = [
                    ...m.frames,
                    { winnerId: action.winnerId, loserRemaining: action.loserRemaining },
                ];

                // If QF changed frames and no longer tied 1–1 after two, clear spot-shot winner
                return { ...m, frames: nextFrames };
            });

            return { ...state, knockout: recomputeWinners(ko) };
        }

        case "knockout/removeFrame": {
            const ko = state.knockout.map((m) => {
                if (m.id !== action.matchId) return m;
                if (action.frameIndex < 0 || action.frameIndex >= m.frames.length) return m;

                const nextFrames = m.frames.slice();
                nextFrames.splice(action.frameIndex, 1);

                return { ...m, frames: nextFrames };
            });

            return { ...state, knockout: recomputeWinners(ko) };
        }

        case "knockout/clearMatch": {
            const ko = state.knockout.map((m) =>
                m.id === action.matchId
                    ? { ...m, frames: [], winnerId: null }
                    : m
            );

            return { ...state, knockout: recomputeWinners(ko) };
        }

        default:
            return state;
    }
}
