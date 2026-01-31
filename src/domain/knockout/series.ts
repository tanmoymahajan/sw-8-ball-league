// src/domain/knockout/series.ts
import type { FrameResult, SeriesFormat } from "./types";

export function isValidRemaining(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 7;
}

export function computeFrameWins(frames: FrameResult[]): Map<string, number> {
  const wins = new Map<string, number>();
  for (const f of frames) wins.set(f.winnerId, (wins.get(f.winnerId) ?? 0) + 1);
  return wins;
}

export function computeSeriesWinner(
  format: SeriesFormat,
  frames: FrameResult[],
  tiebreakWinnerId: string | null
): string | null {
  if (format === "bo3") {
    const wins = computeFrameWins(frames);
    for (const [pid, w] of wins.entries()) if (w >= 2) return pid;
    return null;
  }

  // bo2 + spot-shot
  if (frames.length < 2) return null;

  const wins2 = computeFrameWins(frames.slice(0, 2));
  for (const [pid, w] of wins2.entries()) {
    if (w === 2) return pid; // 2-0
  }

  // Must be 1-1 after two frames -> spot-shot decides
  return tiebreakWinnerId ?? null;
}

export function maxFramesFor(format: SeriesFormat): number {
  return format === "bo3" ? 3 : 2; // IMPORTANT: QF max 2 frames
}

export function isSplitAfterTwo(frames: FrameResult[]): boolean {
  if (frames.length < 2) return false;
  const wins2 = computeFrameWins(frames.slice(0, 2));
  const values = Array.from(wins2.values());
  return values.includes(1) && values.reduce((a, b) => a + b, 0) === 2; // 1-1
}

export function canAddFrame(format: SeriesFormat, frames: FrameResult[], tiebreakWinnerId: string | null): boolean {
  if (frames.length >= maxFramesFor(format)) return false;

  if (format === "bo3") {
    return true; // UI/reducer can also stop when winner decided, but not required
  }

  // bo2: allow only frame 1 and 2. No frame 3 ever.
  return frames.length < 2;
}

export function canSetTiebreak(format: SeriesFormat, frames: FrameResult[]): boolean {
  if (format !== "bo2_tb") return false;
  if (frames.length < 2) return false;
  return isSplitAfterTwo(frames);
}
