import type { Match, Player, StandingRow, GroupId } from "./types";

export function computeStandings(players: Player[], matches: Match[], group: GroupId): StandingRow[] {
    const rows = new Map<string, StandingRow>();

    for (const p of players.filter((x) => x.group === group)) {
        rows.set(p.id, {
            playerId: p.id,
            name: p.name,
            group: p.group,
            played: 0,
            wins: 0,
            losses: 0,
            points: 0,
            ballDiff: 0,
            ballsFor: 0,
            ballsAgainst: 0,
        });
    }

    for (const m of matches) {
        if (m.group !== group || !m.completed) continue;

        const r1 = rows.get(m.p1Id);
        const r2 = rows.get(m.p2Id);
        if (!r1 || !r2) continue;

        if (!m.winnerId || m.loserRemaining === null) continue;

        const loserRemaining = m.loserRemaining; // 0..7
        const winnerIsP1 = m.winnerId === m.p1Id;

        // played
        r1.played += 1;
        r2.played += 1;

        // points + W/L
        if (winnerIsP1) {
            r1.wins += 1;
            r2.losses += 1;
            r1.points += 2;
        } else {
            r2.wins += 1;
            r1.losses += 1;
            r2.points += 2;
        }

        // ball difference effect = opponent balls remaining
        // winner +loserRemaining, loser -loserRemaining
        if (winnerIsP1) {
            r1.ballDiff += loserRemaining;
            r2.ballDiff -= loserRemaining;
        } else {
            r2.ballDiff += loserRemaining;
            r1.ballDiff -= loserRemaining;
        }
    }

    const list = Array.from(rows.values());
    list.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.ballDiff !== a.ballDiff) return b.ballDiff - a.ballDiff;
        if (b.ballsFor !== a.ballsFor) return b.ballsFor - a.ballsFor;
        return a.name.localeCompare(b.name);
    });

    return list;
}

export function matchProgress(matches: Match[], group: GroupId): { completed: number; total: number } {
    const g = matches.filter((m) => m.group === group);
    return { completed: g.filter((m) => m.completed).length, total: g.length };
}
