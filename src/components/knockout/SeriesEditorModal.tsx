// src/components/knockout/SeriesEditorModal.tsx
import React, { useMemo, useState } from "react";
import type { SeriesMatch } from "../../domain/knockout/types";
import type { Player } from "../../domain/tournament/types";
import { Modal } from "../layout/Modal";
import {
    canAddFrame,
    computeSeriesWinner,
    isSplitAfterTwo,
    isValidRemaining,
} from "../../domain/knockout/series";

type Participants = { aId: string | null; bId: string | null };

type FrameValidation =
    | { ok: true; winnerId: string; loserRemaining: number }
    | { ok: false; msg: string };

export function SeriesEditorModal({
                                      match,
                                      participants,
                                      pById,
                                      onClose,
                                      onAddFrame,
                                      onRemoveFrame,
                                      onClear,
                                      onSetTiebreakWinner,
                                      onClearTiebreak,
                                  }: {
    match: SeriesMatch;
    participants: Participants;
    pById: Map<string, Player>;
    onClose: () => void;
    onAddFrame: (winnerId: string, loserRemaining: number) => void;
    onRemoveFrame: (frameIndex: number) => void;
    onClear: () => void;
    onSetTiebreakWinner: (winnerId: string) => void;
    onClearTiebreak: () => void;
}) {
    const aId = participants.aId;
    const bId = participants.bId;

    const canEdit = Boolean(aId && bId);

    const aName = aId ? pById.get(aId)?.name ?? "TBD" : "TBD";
    const bName = bId ? pById.get(bId)?.name ?? "TBD" : "TBD";

    // Frame input state
    const [frameWinnerId, setFrameWinnerId] = useState<string>(() => aId ?? bId ?? "");
    const [remainingText, setRemainingText] = useState<string>("");

    const seriesWinnerId = computeSeriesWinner(match.format, match.frames);
    const seriesWinnerName = seriesWinnerId ? pById.get(seriesWinnerId)?.name ?? "Winner" : null;

    const canAdd = useMemo(() => {
        if (!canEdit) return false;
        return canAddFrame(match.format, match.frames);
    }, [canEdit, match.format, match.frames]);

    const frameValidation: FrameValidation = useMemo(() => {
        if (!canEdit || !aId || !bId) {
            return { ok: false, msg: "Participants not decided yet (finish earlier matches first)." };
        }

        const w = frameWinnerId.trim();
        if (!w) return { ok: false, msg: "Select frame winner." };
        if (w !== aId && w !== bId) return { ok: false, msg: "Winner must be one of the participants." };

        const n = Number(remainingText);
        if (!Number.isFinite(n) || !Number.isInteger(n) || !isValidRemaining(n)) {
            return { ok: false, msg: "Opponent balls remaining must be an integer from 0 to 7." };
        }

        return { ok: true, winnerId: w, loserRemaining: n };
    }, [canEdit, aId, bId, canAdd, frameWinnerId, remainingText]);

    const loserNameForFrame = (winner: string) => {
        if (!aId || !bId) return "Opponent";
        return winner === aId ? bName : aName;
    };

    return (
        <Modal
            title={`${match.id} • ${aName} vs ${bName}`}
            onClose={onClose}
            footer={
                <>
                    <button className="secondaryBtn" type="button" onClick={onClear}>
                        Clear Match
                    </button>

                    <button
                        className="primaryBtn"
                        type="button"
                        disabled={!frameValidation.ok}
                        onClick={() => {
                            if (!frameValidation.ok) return;
                            onAddFrame(frameValidation.winnerId, frameValidation.loserRemaining);
                            setRemainingText("");
                        }}
                    >
                        Add Frame
                    </button>
                </>
            }
        >
            <div className="modalHint">
                Format:{" "}
                {match.format === "bo2_tb"
                    ? "Quarterfinal — Best of 2 frames + Spot-shot tiebreak (if 1–1)"
                    : "Best of 3 frames (first to 2)"}.
                {seriesWinnerName ? ` Winner decided: ${seriesWinnerName}.` : ""}
            </div>

            {!canEdit ? (
                <div className="errorText">Participants TBD — complete earlier matches first.</div>
            ) : null}

            <div style={{ display: "grid", gap: 10, marginTop: 12, opacity: canEdit ? 1 : 0.6 }}>
                <div className="formRow">
                    <label className="label">Frame winner</label>

                    <div style={{ display: "grid", gap: 8 }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="radio"
                                name={`frame_winner_${match.id}`}
                                checked={aId ? frameWinnerId === aId : false}
                                onChange={() => aId && setFrameWinnerId(aId)}
                                disabled={!canEdit}
                            />
                            <span>{aName}</span>
                        </label>

                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="radio"
                                name={`frame_winner_${match.id}`}
                                checked={bId ? frameWinnerId === bId : false}
                                onChange={() => bId && setFrameWinnerId(bId)}
                                disabled={!canEdit}
                            />
                            <span>{bName}</span>
                        </label>
                    </div>
                </div>

                <div className="formRow">
                    <label className="label">Opponent balls remaining (0–7)</label>
                    <input
                        className="scoreInput"
                        inputMode="numeric"
                        value={remainingText}
                        onChange={(e) => setRemainingText(e.target.value)}
                        placeholder="0 to 7"
                        disabled={!canEdit}
                    />
                </div>

                {!frameValidation.ok ? <div className="errorText">{frameValidation.msg}</div> : null}
            </div>

            {/* Frames list */}
            <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Frames</div>

                {match.frames.length === 0 ? (
                    <div className="muted">No frames yet.</div>
                ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                        {match.frames.map((f, idx) => {
                            const wName = pById.get(f.winnerId)?.name ?? "Winner";
                            const loserName = loserNameForFrame(f.winnerId);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        alignItems: "center",
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(0,0,0,0.18)",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 900 }}>
                                            Frame {idx + 1}: {wName} won
                                        </div>
                                        <div className="muted">{loserName} remaining: {f.loserRemaining}</div>
                                    </div>

                                    <button className="dangerBtn" type="button" onClick={() => onRemoveFrame(idx)}>
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
}
