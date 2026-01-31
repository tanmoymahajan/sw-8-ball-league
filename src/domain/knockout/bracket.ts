// src/domain/knockout/bracket.ts
import type { SeriesMatch } from "./types";
import type { Player, Match } from "../tournament/types";
import { computeStandings } from "../tournament/scoring";

/**
 * Helper: get winner + runner-up (top 2) for a group.
 * Returns null if fewer than 2 players are available.
 */
function topTwo(
    players: Player[],
    matches: Match[],
    group: "A" | "B" | "C" | "D"
): { w: string; r: string } | null {
    const rows = computeStandings(players, matches, group);
    if (rows.length < 2) return null;
    return { w: rows[0].playerId, r: rows[1].playerId };
}

/**
 * Build the knockout bracket from current group standings.
 *
 * QF1: A1 vs C2
 * QF2: B1 vs D2
 * QF3: C1 vs A2
 * QF4: D1 vs B2
 *
 * SF1: W(QF1) vs W(QF3)
 * SF2: W(QF2) vs W(QF4)
 *
 * 3rd: L(SF1) vs L(SF2)
 * Final: W(SF1) vs W(SF2)
 */
export function buildKnockoutBracket(
    players: Player[],
    matches: Match[]
): SeriesMatch[] {
    const A = topTwo(players, matches, "A");
    const B = topTwo(players, matches, "B");
    const C = topTwo(players, matches, "C");
    const D = topTwo(players, matches, "D");

    const safe = (
        x: { w: string; r: string } | null,
        k: "w" | "r"
    ): string => x?.[k] ?? "";

    return [
        {
            id: "QF1",
            label: "QF1: A1 vs C2",
            format: "bo2_tb",
            slotA: { kind: "player", playerId: safe(A, "w") },
            slotB: { kind: "player", playerId: safe(C, "r") },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "QF2",
            label: "QF2: B1 vs D2",
            format: "bo2_tb",
            slotA: { kind: "player", playerId: safe(B, "w") },
            slotB: { kind: "player", playerId: safe(D, "r") },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "QF3",
            label: "QF3: C1 vs A2",
            format: "bo2_tb",
            slotA: { kind: "player", playerId: safe(C, "w") },
            slotB: { kind: "player", playerId: safe(A, "r") },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "QF4",
            label: "QF4: D1 vs B2",
            format: "bo2_tb",
            slotA: { kind: "player", playerId: safe(D, "w") },
            slotB: { kind: "player", playerId: safe(B, "r") },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "SF1",
            label: "SF1: W(QF1) vs W(QF3)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "QF1" },
            slotB: { kind: "winnerOf", matchId: "QF3" },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "SF2",
            label: "SF2: W(QF2) vs W(QF4)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "QF2" },
            slotB: { kind: "winnerOf", matchId: "QF4" },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "THIRD",
            label: "3rd Place: L(SF1) vs L(SF2)",
            format: "bo3",
            slotA: { kind: "loserOf", matchId: "SF1" },
            slotB: { kind: "loserOf", matchId: "SF2" },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
        {
            id: "FINAL",
            label: "Final: W(SF1) vs W(SF2)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "SF1" },
            slotB: { kind: "winnerOf", matchId: "SF2" },
            frames: [],
            winnerId: null,
            tiebreakWinnerId: null,
        },
    ];
}
