import React from "react";
import type { SeriesMatch } from "../../domain/knockout/types";
import { Card } from "../layout/Card";
import { isSplitAfterTwo } from "../../domain/knockout/series";

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

    const right = winnerName ? (
        <span className="badge">Winner: {winnerName}</span>
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
