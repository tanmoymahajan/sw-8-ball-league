import type { Player } from "../tournament/types";
import type { SeriesMatch, SeriesSlot, StageId } from "./types";

export type ResolvedParticipants = { aId: string | null; bId: string | null };

export function playersById(players: Player[]): Map<string, Player> {
    return new Map(players.map((p) => [p.id, p]));
}

function resolveSlotPlayerId(
    slot: SeriesSlot,
    matchesById: Map<StageId, SeriesMatch>,
    resolvedByMatch: Map<StageId, ResolvedParticipants>
): string | null {
    if (slot.kind === "player") return slot.playerId || null;

    const src = matchesById.get(slot.matchId);
    if (!src) return null;

    const winner = src.winnerId;
    if (!winner) return null;

    if (slot.kind === "winnerOf") return winner;

    // loserOf: need resolved participants A/B to determine other side
    const rp = resolvedByMatch.get(slot.matchId);
    if (!rp?.aId || !rp?.bId) return null;
    return winner === rp.aId ? rp.bId : rp.aId;
}

/**
 * Resolve A/B player ids for every match, in bracket order.
 * Works because our bracket list is already topologically ordered:
 * QFs -> SFs -> THIRD/FINAL.
 */
export function resolveAllParticipants(knockout: SeriesMatch[]): Map<StageId, ResolvedParticipants> {
    const byId = new Map<StageId, SeriesMatch>(knockout.map((m) => [m.id, m]));
    const resolved = new Map<StageId, ResolvedParticipants>();

    for (const m of knockout) {
        const aId = resolveSlotPlayerId(m.slotA, byId, resolved);
        const bId = resolveSlotPlayerId(m.slotB, byId, resolved);
        resolved.set(m.id, { aId, bId });
    }

    return resolved;
}
