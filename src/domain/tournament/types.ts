import {SeriesMatch} from "../knockout/types";

export type GroupId = "A" | "B" | "C" | "D";

export type Player = {
    id: string;
    group: GroupId;
    name: string;
};

export type Match = {
    id: string;
    group: GroupId;
    p1Id: string;
    p2Id: string;

    // NEW scoring model:
    winnerId: string | null;        // p1Id or p2Id when completed
    loserRemaining: number | null;  // 0..7 (balls left for the loser)

    completed: boolean;
    updatedAt: string | null;
};

export type TournamentState = {
    players: Player[];
    matches: Match[];          // group stage
    knockout: SeriesMatch[];   // NEW
};


export type StandingRow = {
    playerId: string;
    name: string;
    group: GroupId;
    played: number;
    wins: number;
    losses: number;
    points: number;
    ballDiff: number;
    ballsFor: number;
    ballsAgainst: number;
};
