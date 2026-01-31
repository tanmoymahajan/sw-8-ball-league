import type { GroupId } from "./types";

export const LS_KEY = "eightball_tracker_v6";
export const GROUPS: GroupId[] = ["A", "B", "C", "D"];

// Optional: if you always play "race to 7", set this
export const MAX_BALLS_PER_GAME: number | null = null; // e.g. 7
