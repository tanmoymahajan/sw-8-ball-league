import type { Match } from "./types";

export function isGroupStageComplete(matches: Match[]): boolean {
    // group stage matches are your `state.matches`
    return matches.length > 0 && matches.every((m) => m.completed === true);
}

export function groupStageProgress(matches: Match[]): { completed: number; total: number } {
    const total = matches.length;
    const completed = matches.reduce((acc, m) => acc + (m.completed ? 1 : 0), 0);
    return { completed, total };
}
