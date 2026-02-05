export type StageId = 
  | "S16M1" | "S16M2" | "S16M3" | "S16M4" | "S16M5" | "S16M6" | "S16M7" | "S16M8"
  | "QF1" | "QF2" | "QF3" | "QF4" 
  | "SF1" | "SF2" 
  | "THIRD" | "FINAL";

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

  frames: FrameResult[];         // bo3: max 3
  tiebreakWinnerId: string | null; // not used anymore (all bo3 now)
  winnerId: string | null;       // computed
};
