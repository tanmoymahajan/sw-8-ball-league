import React from "react";
import type { SeriesMatch } from "../../domain/knockout/types";

function formatLabel(m: SeriesMatch): string {
    return m.format === "bo3" ? "BO3" : "BO5";
}

function framesSummary(m: SeriesMatch): string {
    if (m.frames.length === 0) return "No frames yet";
    return `${m.frames.length} frame(s) recorded`;
}

export function KnockoutMatchCard({
                                      match,
                                      aName,
                                      bName,
                                      aId,
                                      bId,
                                      winnerName,
                                      isAdmin,
                                      onOpen,
                                  }: {
    match: SeriesMatch;
    aName: string;
    bName: string;
    aId: string | null;
    bId: string | null;
    winnerName: string | null;
    isAdmin: boolean;
    onOpen: () => void;
}) {
    const isCompleted = Boolean(winnerName);

    const right = winnerName ? (
        <span className="badge">Winner: {winnerName}</span>
    ) : (
        <span className="muted">{formatLabel(match)}</span>
    );

    const getLoserName = (frameWinnerId: string): string => {
        if (!aId || !bId) return "Opponent";
        return frameWinnerId === aId ? bName : aName;
    };

    const getWinnerName = (frameWinnerId: string): string => {
        if (!aId || !bId) return "Winner";
        return frameWinnerId === aId ? aName : bName;
    };

    return (
        <div
            style={{
                background: isCompleted ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.18)",
                border: isCompleted ? "1px solid rgba(34,197,94,0.22)" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                padding: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {match.id} • {match.label}
                </div>
                {right}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                    {aName} vs {bName}
                </div>
                {!isCompleted && <div className="muted">{framesSummary(match)}</div>}
            </div>

            {isCompleted && match.frames.length > 0 ? (
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {match.frames.map((frame, idx) => (
                        <div
                            key={idx}
                            style={{
                                fontSize: 13,
                                padding: "6px 10px",
                                borderRadius: 8,
                                background: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div>
                                <strong>Frame {idx + 1}:</strong> {getWinnerName(frame.winnerId)} won
                            </div>
                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                                {getLoserName(frame.winnerId)}'s balls remaining on table: {frame.loserRemaining}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {isAdmin && (
                <div style={{ marginTop: 10 }}>
                    <button
                        className={"primaryBtn"}
                        type="button"
                        onClick={onOpen}
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}
