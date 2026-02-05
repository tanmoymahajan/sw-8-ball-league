// src/domain/knockout/series.ts
import type { FrameResult } from "./types";

export function isValidRemaining(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 7;
}

export function computeFrameWins(frames: FrameResult[]): Map<string, number> {
  const wins = new Map<string, number>();
  for (const f of frames) wins.set(f.winnerId, (wins.get(f.winnerId) ?? 0) + 1);
  return wins;
}

export function computeSeriesWinner(
  frames: FrameResult[],
): string | null {
  // All matches are now Best of 3
  const wins = computeFrameWins(frames);
  for (const [pid, w] of wins.entries()) if (w >= 2) return pid;
  return null;
}

export function maxFramesFor(): number {
  return 3; // All matches are Best of 3
}

export function isSplitAfterTwo(frames: FrameResult[]): boolean {
  // Not used anymore, but kept for backwards compatibility
  if (frames.length < 2) return false;
  const wins2 = computeFrameWins(frames.slice(0, 2));
  const values = Array.from(wins2.values());
  return values.includes(1) && values.reduce((a, b) => a + b, 0) === 2;
}

export function canAddFrame(frames: FrameResult[]): boolean {
  if (frames.length >= maxFramesFor()) return false;
  // All matches are Best of 3, so always allow up to 3 frames
  return true;
}
