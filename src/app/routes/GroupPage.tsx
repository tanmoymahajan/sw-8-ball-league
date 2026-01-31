import React, { useMemo, useState } from "react";
import type { GroupId } from "../../domain/tournament/types";
import { useTournament } from "../providers/TournamentProvider";
import { playersById as mapPlayersById, matchesForGroup } from "../../domain/tournament/selectors";
import { computeStandings, matchProgress } from "../../domain/tournament/scoring";
import { Card } from "../../components/layout/Card";
import { StandingsTable } from "../../components/tournament/StandingsTable";
import { MatchesList } from "../../components/tournament/MatchesList";
import { MatchEditorModal } from "../../components/tournament/MatchEditorModal";
import {useAdmin} from "../providers/AdminProvider";
import {AddPlayerModal} from "../../components/tournament/AddPlayerModal";

export function GroupPage({ group }: { group: GroupId }) {
    const { state, dispatch } = useTournament();
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const { isAdmin } = useAdmin();
    const [addOpen, setAddOpen] = useState(false);

    const pById = useMemo(() => mapPlayersById(state.players), [state.players]);
    const matches = useMemo(() => matchesForGroup(state.matches, group), [state.matches, group]);
    const standings = useMemo(() => computeStandings(state.players, state.matches, group), [state.players, state.matches, group]);
    const progress = useMemo(() => matchProgress(state.matches, group), [state.matches, group]);

    const editingMatch = editingMatchId ? state.matches.find((m) => m.id === editingMatchId) ?? null : null;

    return (
        <>
            <div className="grid">
                <Card
                    title={`Standings — Group ${group}`}
                    right={
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span className="badge">Matches: {progress.completed}/{progress.total}</span>
                            {isAdmin ? (
                                <button className="primaryBtn" type="button" onClick={() => setAddOpen(true)}>
                                    + Add Player
                                </button>
                            ) : null}
                        </div>
                    }
                >
                <StandingsTable rows={standings} />

                    <div className="hint">Tip: edit player names directly in the table.</div>
                </Card>

                <Card title={`Matches — Group ${group}`} right={<span className="muted">Tap a match to enter score</span>}>
                    <MatchesList
                        matches={matches}
                        playersById={pById}
                        onOpen={(matchId) => {
                            if (!isAdmin) return;
                            setEditingMatchId(matchId);
                        }}
                        isAdmin={isAdmin}
                    />

                </Card>
            </div>

            {isAdmin && editingMatch ? (
                <MatchEditorModal
                    match={editingMatch}
                    p1={pById.get(editingMatch.p1Id)}
                    p2={pById.get(editingMatch.p2Id)}
                    onClose={() => setEditingMatchId(null)}
                    onSave={(matchId, winnerId, loserRemaining) => {
                        dispatch({ type: "match/setResult", matchId, winnerId, loserRemaining });
                        setEditingMatchId(null);
                    }}
                    onClear={(matchId) => {
                        dispatch({ type: "match/clear", matchId });
                        setEditingMatchId(null);
                    }}
                />
            ) : null}

            {addOpen ? (
                <AddPlayerModal
                    group={group}
                    existingNames={state.players.filter((p) => p.group === group).map((p) => p.name)}
                    onClose={() => setAddOpen(false)}
                    onAdd={(name) => {
                        dispatch({ type: "player/addToGroup", group, name });
                        setAddOpen(false);
                    }}
                />
            ) : null}

        </>
    );
}
