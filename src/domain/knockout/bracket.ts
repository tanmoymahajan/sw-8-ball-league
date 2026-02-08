// src/domain/knockout/bracket.ts
import type { SeriesMatch } from "./types";
import type { Player, Match } from "../tournament/types";
import { computeStandings } from "../tournament/scoring";

/**
 * Helper: get top 4 players for a group.
 * Returns null if fewer than 4 players are available.
 */
function topFour(
    players: Player[],
    matches: Match[],
    group: "A" | "B" | "C" | "D"
): { first: string; second: string; third: string; fourth: string } | null {
    const rows = computeStandings(players, matches, group);
    if (rows.length < 4) return null;
    return { 
        first: rows[0].playerId, 
        second: rows[1].playerId,
        third: rows[2].playerId,
        fourth: rows[3].playerId
    };
}

/**
 * Build the knockout bracket from current group standings.
 *
 * SUPER 16 (Best of 3):
 * S16M1: A1 vs B4
 * S16M2: A2 vs B3
 * S16M3: A3 vs B2
 * S16M4: A4 vs B1
 * S16M5: C1 vs D4
 * S16M6: C2 vs D3
 * S16M7: C3 vs D2
 * S16M8: C4 vs D1
 *
 * Quarter-Finals (Best of 3):
 * QF1: W(S16M1) vs W(S16M8)
 * QF2: W(S16M2) vs W(S16M7)
 * QF3: W(S16M3) vs W(S16M6)
 * QF4: W(S16M4) vs W(S16M5)
 *
 * Semi-Finals (Best of 3):
 * SF1: W(QF1) vs W(QF4)
 * SF2: W(QF2) vs W(QF3)
 *
 * 3rd Place (Best of 3):
 * L(SF1) vs L(SF2)
 *
 * Final (Best of 3):
 * W(SF1) vs W(SF2)
 */
export function buildKnockoutBracket(
    players: Player[],
    matches: Match[]
): SeriesMatch[] {
    const A = topFour(players, matches, "A");
    const B = topFour(players, matches, "B");
    const C = topFour(players, matches, "C");
    const D = topFour(players, matches, "D");

    const safe = (
        x: { first: string; second: string; third: string; fourth: string } | null,
        k: "first" | "second" | "third" | "fourth"
    ): string => x?.[k] ?? "";

    return [
        // SUPER 16
        {
            id: "S16M1",
            label: "Super 16 M1: A1 vs B4",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(A, "first") },
            slotB: { kind: "player", playerId: safe(B, "fourth") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M2",
            label: "Super 16 M2: A2 vs B3",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(A, "second") },
            slotB: { kind: "player", playerId: safe(B, "third") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M3",
            label: "Super 16 M3: A3 vs B2",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(A, "third") },
            slotB: { kind: "player", playerId: safe(B, "second") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M4",
            label: "Super 16 M4: A4 vs B1",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(A, "fourth") },
            slotB: { kind: "player", playerId: safe(B, "first") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M5",
            label: "Super 16 M5: C1 vs D4",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(C, "first") },
            slotB: { kind: "player", playerId: safe(D, "fourth") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M6",
            label: "Super 16 M6: C2 vs D3",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(C, "second") },
            slotB: { kind: "player", playerId: safe(D, "third") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M7",
            label: "Super 16 M7: C3 vs D2",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(C, "third") },
            slotB: { kind: "player", playerId: safe(D, "second") },
            frames: [],
            winnerId: null
        },
        {
            id: "S16M8",
            label: "Super 16 M8: C4 vs D1",
            format: "bo3",
            slotA: { kind: "player", playerId: safe(C, "fourth") },
            slotB: { kind: "player", playerId: safe(D, "first") },
            frames: [],
            winnerId: null
        },

        // QUARTER-FINALS
        {
            id: "QF1",
            label: "QF1: W(S16M1) vs W(S16M8)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "S16M1" },
            slotB: { kind: "winnerOf", matchId: "S16M8" },
            frames: [],
            winnerId: null
        },
        {
            id: "QF2",
            label: "QF2: W(S16M2) vs W(S16M7)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "S16M2" },
            slotB: { kind: "winnerOf", matchId: "S16M7" },
            frames: [],
            winnerId: null
        },
        {
            id: "QF3",
            label: "QF3: W(S16M3) vs W(S16M6)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "S16M3" },
            slotB: { kind: "winnerOf", matchId: "S16M6" },
            frames: [],
            winnerId: null
        },
        {
            id: "QF4",
            label: "QF4: W(S16M4) vs W(S16M5)",
            format: "bo3",
            slotA: { kind: "winnerOf", matchId: "S16M4" },
            slotB: { kind: "winnerOf", matchId: "S16M5" },
            frames: [],
            winnerId: null
        },

        // SEMI-FINALS
        {
            id: "SF1",
            label: "SF1: W(QF1) vs W(QF4)",
            format: "bo5",
            slotA: { kind: "winnerOf", matchId: "QF1" },
            slotB: { kind: "winnerOf", matchId: "QF4" },
            frames: [],
            winnerId: null
        },
        {
            id: "SF2",
            label: "SF2: W(QF2) vs W(QF3)",
            format: "bo5",
            slotA: { kind: "winnerOf", matchId: "QF2" },
            slotB: { kind: "winnerOf", matchId: "QF3" },
            frames: [],
            winnerId: null
        },

        // 3RD PLACE
        {
            id: "THIRD",
            label: "3rd Place: L(SF1) vs L(SF2)",
            format: "bo5",
            slotA: { kind: "loserOf", matchId: "SF1" },
            slotB: { kind: "loserOf", matchId: "SF2" },
            frames: [],
            winnerId: null
        },

        // FINAL
        {
            id: "FINAL",
            label: "Final: W(SF1) vs W(SF2)",
            format: "bo5",
            slotA: { kind: "winnerOf", matchId: "SF1" },
            slotB: { kind: "winnerOf", matchId: "SF2" },
            frames: [],
            winnerId: null
        },
    ];
}
