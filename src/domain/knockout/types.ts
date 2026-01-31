export type StageId = "QF1" | "QF2" | "QF3" | "QF4" | "SF1" | "SF2" | "THIRD" | "FINAL";

export type SeriesFormat = "bo2_tb" | "bo3";

export type FrameResult = {
  winnerId: string;
  loserRemaining: number; // 0..7
};

export type SeriesSlot =
  | { kind: "player"; playerId: string }
  | { kind: "winnerOf"; matchId: StageId }
  | { kind: "loserOf"; matchId: StageId };

export type SeriesMatch = {
  id: StageId;
  label: string;
  format: SeriesFormat;

  slotA: SeriesSlot;
  slotB: SeriesSlot;

  frames: FrameResult[];         // QF: max 2, BO3: max 3
  tiebreakWinnerId: string | null; // NEW: only used for QF when frames are 1–1
  winnerId: string | null;       // computed
};
