import type { GroupId, Match, Player } from "./types";

export function playersById(players: Player[]): Map<string, Player> {
    return new Map(players.map((p) => [p.id, p]));
}

export function matchesForGroup(matches: Match[], group: GroupId): Match[] {
    return matches
        .filter((m) => m.group === group)
        .slice()
        .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return tb - ta;
        });
}
