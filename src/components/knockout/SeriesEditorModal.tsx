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

type SpotValidation =
    | { ok: true; winnerId: string }
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

    // Spot-shot input state (QF tiebreak)
    const [spotWinnerId, setSpotWinnerId] = useState<string>(() => aId ?? bId ?? "");

    const isQF = match.format === "bo2_tb";
    const afterTwoSplit =
        isQF && match.frames.length >= 2 && isSplitAfterTwo(match.frames.slice(0, 2));
    const needsSpotShot = afterTwoSplit; // by rule, QF tiebreak is spot-shot

    const seriesWinnerId = computeSeriesWinner(match.format, match.frames, match.tiebreakWinnerId);
    const seriesWinnerName = seriesWinnerId ? pById.get(seriesWinnerId)?.name ?? "Winner" : null;

    const canAdd = useMemo(() => {
        if (!canEdit) return false;
        return canAddFrame(match.format, match.frames, match.tiebreakWinnerId);
    }, [canEdit, match.format, match.frames, match.tiebreakWinnerId]);

    const frameValidation: FrameValidation = useMemo(() => {
        if (!canEdit || !aId || !bId) {
            return { ok: false, msg: "Participants not decided yet (finish earlier matches first)." };
        }

        if (!canAdd) {
            if (isQF && needsSpotShot) {
                return { ok: false, msg: "QF tied 1–1. Decide spot-shot winner (no extra frame)." };
            }
            return { ok: false, msg: "No more frames allowed for this match." };
        }

        const w = frameWinnerId.trim();
        if (!w) return { ok: false, msg: "Select frame winner." };
        if (w !== aId && w !== bId) return { ok: false, msg: "Winner must be one of the participants." };

        const n = Number(remainingText);
        if (!Number.isFinite(n) || !Number.isInteger(n) || !isValidRemaining(n)) {
            return { ok: false, msg: "Opponent balls remaining must be an integer from 0 to 7." };
        }

        return { ok: true, winnerId: w, loserRemaining: n };
    }, [canEdit, aId, bId, canAdd, isQF, needsSpotShot, frameWinnerId, remainingText]);

    const spotValidation: SpotValidation = useMemo(() => {
        if (!canEdit || !aId || !bId) {
            return { ok: false, msg: "Participants not decided yet." };
        }
        if (!needsSpotShot) return { ok: false, msg: "Spot-shot not required." };

        const w = spotWinnerId.trim();
        if (!w) return { ok: false, msg: "Select spot-shot winner." };
        if (w !== aId && w !== bId) return { ok: false, msg: "Spot-shot winner must be one of the participants." };

        return { ok: true, winnerId: w };
    }, [canEdit, aId, bId, needsSpotShot, spotWinnerId]);

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
                        title={!canAdd && isQF ? "QF allows only 2 frames. Use spot-shot if tied 1–1." : undefined}
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

            {/* Spot-shot tiebreaker (QF only, when tied 1-1 after two frames) */}
            {needsSpotShot ? (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>Spot-shot tiebreaker</div>

                    <div className="modalHint">
                        QF is tied 1–1 after 2 frames. Select the spot-shot winner (no extra frame).
                    </div>

                    <div style={{ display: "grid", gap: 8, marginTop: 10, opacity: canEdit ? 1 : 0.6 }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="radio"
                                name={`spot_${match.id}`}
                                checked={aId ? spotWinnerId === aId : false}
                                onChange={() => aId && setSpotWinnerId(aId)}
                                disabled={!canEdit}
                            />
                            <span>{aName}</span>
                        </label>

                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                type="radio"
                                name={`spot_${match.id}`}
                                checked={bId ? spotWinnerId === bId : false}
                                onChange={() => bId && setSpotWinnerId(bId)}
                                disabled={!canEdit}
                            />
                            <span>{bName}</span>
                        </label>

                        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                            <button
                                className="primaryBtn"
                                type="button"
                                disabled={!spotValidation.ok}
                                onClick={() => {
                                    if (!spotValidation.ok) return;
                                    onSetTiebreakWinner(spotValidation.winnerId);
                                    onClose();
                                }}
                            >
                                Save Spot-shot Winner
                            </button>

                            <button className="secondaryBtn" type="button" onClick={onClearTiebreak}>
                                Clear Spot-shot
                            </button>
                        </div>

                        {!spotValidation.ok ? <div className="errorText">{spotValidation.msg}</div> : null}

                        {match.tiebreakWinnerId ? (
                            <div className="modalHint">
                                Current spot-shot winner:{" "}
                                <b>{pById.get(match.tiebreakWinnerId)?.name ?? "Winner"}</b>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
