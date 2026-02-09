// src/app/routes/KnockoutPage.tsx
import React, { useMemo, useState } from "react";
import { useTournament } from "../providers/TournamentProvider";
import { useAdmin } from "../providers/AdminProvider";
import { Card } from "../../components/layout/Card";
import type { StageId } from "../../domain/knockout/types";
import { resolveAllParticipants, playersById as mapPlayersById } from "../../domain/knockout/resolve";
import { SeriesEditorModal } from "../../components/knockout/SeriesEditorModal";
import { KnockoutMatchCard } from "../../components/knockout/KnockoutMatchCard";
import type { Match as GroupMatch } from "../../domain/tournament/types";

function isGroupStageComplete(matches: GroupMatch[]): boolean {
    return matches.length > 0 && matches.every((m) => m.completed);
}

function groupStageProgress(matches: GroupMatch[]): { completed: number; total: number } {
    const total = matches.length;
    const completed = matches.reduce((acc, m) => acc + (m.completed ? 1 : 0), 0);
    return { completed, total };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card title={title}>
            <div style={{ display: "grid", gap: 12 }}>{children}</div>
        </Card>
    );
}

export function KnockoutPage() {
    const { state, dispatch } = useTournament();
    const { isAdmin } = useAdmin();

    const [editing, setEditing] = useState<StageId | null>(null);

    const pById = useMemo(() => mapPlayersById(state.players), [state.players]);
    const resolved = useMemo(() => resolveAllParticipants(state.knockout), [state.knockout]);

    const editingMatch = useMemo(() => {
        if (!editing) return null;
        return state.knockout.find((m) => m.id === editing) ?? null;
    }, [editing, state.knockout]);

    const byId = useMemo(() => new Map(state.knockout.map((m) => [m.id, m] as const)), [state.knockout]);

    const gp = useMemo(() => groupStageProgress(state.matches), [state.matches]);
    const groupsOver = useMemo(() => isGroupStageComplete(state.matches), [state.matches]);

    const s16s = ["S16M1", "S16M2", "S16M3", "S16M4", "S16M5", "S16M6", "S16M7", "S16M8"] as const;
    const qfs = ["QF1", "QF2", "QF3", "QF4"] as const;
    const sfs = ["SF1", "SF2"] as const;
    const finals = ["THIRD", "FINAL"] as const;

    const renderMatch = (id: StageId) => {
        const m = byId.get(id);
        if (!m) return null;

        const rp = resolved.get(m.id);
        const aName = rp?.aId ? pById.get(rp.aId)?.name ?? "TBD" : "TBD";
        const bName = rp?.bId ? pById.get(rp.bId)?.name ?? "TBD" : "TBD";
        const winnerName = m.winnerId ? pById.get(m.winnerId)?.name ?? "Winner" : null;

        return (
            <KnockoutMatchCard
                key={m.id}
                match={m}
                aName={aName}
                bName={bName}
                aId={rp?.aId ?? null}
                bId={rp?.bId ?? null}
                winnerName={winnerName}
                isAdmin={isAdmin}
                onOpen={() => {
                    setEditing(m.id);
                }}
            />
        );
    };

    return (
        <div className="grid">
            <Card
                title="Knockouts"
                right={
                    isAdmin ? (
                        <button
                            className="primaryBtn"
                            type="button"
                            onClick={() => dispatch({ type: "knockout/initFromStandings" })}
                            disabled={true}
                            title={
                                groupsOver
                                    ? "Build bracket from final group standings"
                                    : `Finish group stage first (${gp.completed}/${gp.total} matches completed)`
                            }
                        >
                            Generate from standings
                        </button>
                    ) : (
                        <span className="muted">View only</span>
                    )
                }
            >
                <div className="hint">
                    Super 16, QFs, SFs, 3rd Place, and Final: All Best of 3 frames.
                </div>
                <div className="muted" style={{ marginTop: 6 }}>
                    Group stage progress: {gp.completed}/{gp.total} matches completed.
                </div>
            </Card>

            {state.knockout.length === 0 ? (
                <Card title="No bracket yet">
                    <div className="muted">
                        {isAdmin
                            ? groupsOver
                                ? "Tap \"Generate from standings\" to create the bracket."
                                : "Complete all group matches to enable bracket generation."
                            : "Waiting for admin to generate bracket."}
                    </div>
                </Card>
            ) : (
                <>
                    <Section title="Super 16">{s16s.map((id) => renderMatch(id))}</Section>
                    <Section title="Quarterfinals">{qfs.map((id) => renderMatch(id))}</Section>
                    <Section title="Semifinals">{sfs.map((id) => renderMatch(id))}</Section>
                    <Section title="Finals">{finals.map((id) => renderMatch(id))}</Section>
                </>
            )}

            {editingMatch ? (
                <SeriesEditorModal
                    match={editingMatch}
                    participants={resolved.get(editingMatch.id) ?? { aId: null, bId: null }}
                    pById={pById}
                    isAdmin={isAdmin}
                    onClose={() => setEditing(null)}
                    onAddFrame={(winnerId, loserRemaining) =>
                        dispatch({ type: "knockout/addFrame", matchId: editingMatch.id, winnerId, loserRemaining })
                    }
                    onRemoveFrame={(idx) =>
                        dispatch({ type: "knockout/removeFrame", matchId: editingMatch.id, frameIndex: idx })
                    }
                    onClear={() => dispatch({ type: "knockout/clearMatch", matchId: editingMatch.id })}
                />
            ) : null}
        </div>
    );
}
