import type { Player, Match, TournamentState, GroupId } from "./types";
import { GROUPS } from "./constants";
import { PARTICIPANTS } from "./participants";

function uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// Set to true if you want to force all groups to have the same count
const REQUIRE_EQUAL_GROUP_SIZES = false;

// Minimum players for a meaningful group
const MIN_PLAYERS_PER_GROUP = 2;

function validateParticipants() {
    const sizes = GROUPS.map((g) => PARTICIPANTS[g]?.length ?? 0);

    for (const g of GROUPS) {
        const names = PARTICIPANTS[g];
        if (!names || names.length < MIN_PLAYERS_PER_GROUP) {
            throw new Error(`Group ${g} must have at least ${MIN_PLAYERS_PER_GROUP} participants`);
        }
    }

    if (REQUIRE_EQUAL_GROUP_SIZES) {
        const first = sizes[0];
        const allSame = sizes.every((s) => s === first);
        if (!allSame) {
            throw new Error(`All groups must have the same number of participants when REQUIRE_EQUAL_GROUP_SIZES=true`);
        }
    }

    // Optional: check for duplicates within a group
    for (const g of GROUPS) {
        const names = PARTICIPANTS[g];
        const set = new Set(names.map((n) => n.trim().toLowerCase()));
        if (set.size !== names.length) {
            throw new Error(`Duplicate participant names detected in group ${g}`);
        }
    }
}

export function buildDefaultTournamentState(): TournamentState {
    validateParticipants();

    const players: Player[] = [];

    for (const g of GROUPS) {
        const names = PARTICIPANTS[g];
        names.forEach((name, idx) => {
            players.push({
                id: uid(`p${g}${idx + 1}`),
                group: g,
                name,
            });
        });
    }

    const matches: Match[] = [];
    for (const g of GROUPS) {
        const groupPlayers = players.filter((p) => p.group === g);

        // Round robin pairs
        for (let i = 0; i < groupPlayers.length; i++) {
            for (let j = i + 1; j < groupPlayers.length; j++) {
                matches.push({
                    id: uid(`m${g}`),
                    group: g,
                    p1Id: groupPlayers[i].id,
                    p2Id: groupPlayers[j].id,

                    // winner + opponent remaining model:
                    winnerId: null,
                    loserRemaining: null,

                    completed: false,
                    updatedAt: null,
                });
            }
        }
    }

    return { players, matches, knockout: [] };
}

export function groupSize(group: GroupId): number {
    return PARTICIPANTS[group].length;
}
