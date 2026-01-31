import React from "react";
import type { SeriesMatch } from "../../domain/knockout/types";
import { Card } from "../layout/Card";
import { isSplitAfterTwo } from "../../domain/knockout/series";

function formatLabel(m: SeriesMatch): string {
    return m.format === "bo2_tb" ? "QF • BO2 + Spot-shot" : "BO3";
}

function framesSummary(m: SeriesMatch): string {
    if (m.frames.length === 0) return "No frames yet";
    return `${m.frames.length} frame(s) recorded`;
}

export function KnockoutMatchCard({
                                      match,
                                      aName,
                                      bName,
                                      winnerName,
                                      isAdmin,
                                      onOpen,
                                  }: {
    match: SeriesMatch;
    aName: string;
    bName: string;
    winnerName: string | null;
    isAdmin: boolean;
    onOpen: () => void;
}) {
    const isQF = match.format === "bo2_tb";
    const splitAfterTwo = isQF && match.frames.length >= 2 && isSplitAfterTwo(match.frames.slice(0, 2));

    const right = winnerName ? (
        <span className="badge">Winner: {winnerName}</span>
    ) : splitAfterTwo ? (
        match.tiebreakWinnerId ? (
            <span className="badge">Spot-shot set</span>
        ) : (
            <span className="badge">Spot-shot pending</span>
        )
    ) : (
        <span className="muted">{formatLabel(match)}</span>
    );

    return (
        <Card title={`${match.id} • ${match.label}`} right={right}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                    {aName} vs {bName}
                </div>
                <div className="muted">{framesSummary(match)}</div>
            </div>

            {splitAfterTwo && !winnerName ? (
                <div className="muted" style={{ marginTop: 8 }}>
                    Tied 1–1 after 2 frames. Decide with spot-shot.
                </div>
            ) : null}

            {isQF && match.tiebreakWinnerId && !winnerName ? (
                <div className="muted" style={{ marginTop: 8 }}>
                    Spot-shot winner selected (winner should appear once state recomputes).
                </div>
            ) : null}

            <div style={{ marginTop: 10 }}>
                <button
                    className={isAdmin ? "primaryBtn" : "secondaryBtn"}
                    type="button"
                    onClick={onOpen}
                    disabled={!isAdmin}
                    title={!isAdmin ? "View only (admin required to edit)" : "Edit frames / spot-shot"}
                >
                    {isAdmin ? "Edit" : "View"}
                </button>
            </div>
        </Card>
    );
}
