import React from "react";
import type { Match, Player } from "../../domain/tournament/types";

function label(p1: Player | undefined, p2: Player | undefined, m: Match): string {
    const a = p1?.name ?? "P1";
    const b = p2?.name ?? "P2";

    if (!m.completed || !m.winnerId || m.loserRemaining === null) {
        return `${a} vs ${b}`;
    }

    const winnerName = m.winnerId === m.p1Id ? a : b;
    const loserName = m.winnerId === m.p1Id ? b : a;

    return `${winnerName} beat ${loserName} — ${loserName} remaining: ${m.loserRemaining}`;
}

export function MatchesList({
                                matches,
                                playersById,
                                onOpen,
                                isAdmin,
                            }: {
    matches: Match[];
    playersById: Map<string, Player>;
    onOpen: (matchId: string) => void;
    isAdmin: boolean;
}) {
    return (
        <div className="matchList">
            {matches.map((m) => {
                const p1 = playersById.get(m.p1Id);
                const p2 = playersById.get(m.p2Id);

                return (
                    <button
                        key={m.id}
                        className={`matchRow ${m.completed ? "matchRowDone" : ""}`}
                        onClick={() => isAdmin && onOpen(m.id)}
                        type="button"
                        disabled={!isAdmin}
                        style={!isAdmin ? { opacity: 0.85, cursor: "default" } : undefined}
                        title={!isAdmin ? "View only (admin required to edit)" : "Edit score"}
                    >
                        <div className="matchText">{label(p1, p2, m)}</div>
                        <div className="matchMeta">{m.completed ? "✅" : "➕"}</div>
                    </button>
                );
            })}
        </div>
    );
}

