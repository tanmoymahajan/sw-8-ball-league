import React, { useMemo, useState } from "react";
import type { Match, Player } from "../../domain/tournament/types";
import { Modal } from "../layout/Modal";

function parseRemaining(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === "") return null;

    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;

    const i = Math.trunc(n);
    if (i < 0 || i > 7) return null; // 0..7 balls remaining
    return i;
}

type Validation =
    | { ok: true; winnerId: string; loserRemaining: number }
    | { ok: false; msg: string };

export function MatchEditorModal({
                                     match,
                                     p1,
                                     p2,
                                     onClose,
                                     onSave,
                                     onClear,
                                 }: {
    match: Match;
    p1?: Player;
    p2?: Player;
    onClose: () => void;
    onSave: (matchId: string, winnerId: string, loserRemaining: number) => void;
    onClear: (matchId: string) => void;
}) {
    const p1Id = match.p1Id;
    const p2Id = match.p2Id;

    const [winnerId, setWinnerId] = useState<string | null>(match.winnerId ?? null);
    const [loserRemainingText, setLoserRemainingText] = useState<string>(
        match.loserRemaining === null ? "" : String(match.loserRemaining)
    );

    const validation: Validation = useMemo(() => {
        if (!winnerId) return { ok: false, msg: "Select the winner." };

        const lr = parseRemaining(loserRemainingText);
        if (lr === null) return { ok: false, msg: "Enter opponent balls remaining (0–7)." };

        // Winner must be one of the two players
        if (winnerId !== p1Id && winnerId !== p2Id) return { ok: false, msg: "Invalid winner selected." };

        return { ok: true, winnerId, loserRemaining: lr };
    }, [winnerId, loserRemainingText, p1Id, p2Id]);

    const p1Name = p1?.name ?? "Player 1";
    const p2Name = p2?.name ?? "Player 2";

    const winnerName =
        winnerId === p1Id ? p1Name : winnerId === p2Id ? p2Name : "Winner";
    const loserName =
        winnerId === p1Id ? p2Name : winnerId === p2Id ? p1Name : "Opponent";

    return (
        <Modal
            title={`${p1Name} vs ${p2Name}`}
            onClose={onClose}
            footer={
                <>
                    <button className="secondaryBtn" type="button" onClick={() => onClear(match.id)}>
                        Clear Result
                    </button>
                    <button
                        className="primaryBtn"
                        type="button"
                        disabled={!validation.ok}
                        onClick={() => {
                            if (!validation.ok) return;
                            onSave(match.id, validation.winnerId, validation.loserRemaining);
                        }}
                    >
                        Save Result
                    </button>
                </>
            }
        >
            <div className="formRow">
                <label className="label">Winner</label>
                <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="radio"
                            name={`winner_${match.id}`}
                            checked={winnerId === p1Id}
                            onChange={() => setWinnerId(p1Id)}
                        />
                        <span>{p1Name}</span>
                    </label>

                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="radio"
                            name={`winner_${match.id}`}
                            checked={winnerId === p2Id}
                            onChange={() => setWinnerId(p2Id)}
                        />
                        <span>{p2Name}</span>
                    </label>
                </div>
            </div>

            <div className="formRow">
                <label className="label">
                    Opponent balls remaining on table (for {winnerId ? loserName : "opponent"})
                </label>
                <input
                    className="scoreInput"
                    inputMode="numeric"
                    value={loserRemainingText}
                    onChange={(e) => setLoserRemainingText(e.target.value)}
                    placeholder="0 to 7"
                />
            </div>

            <div className="modalHint">
                Winner gets 2 points. Ball Difference impact = opponent balls remaining.
                {winnerId ? ` ${winnerName} gains +${parseRemaining(loserRemainingText) ?? "?"}.` : ""}
            </div>

            {!validation.ok ? <div className="errorText">{validation.msg}</div> : null}
        </Modal>
    );
}
