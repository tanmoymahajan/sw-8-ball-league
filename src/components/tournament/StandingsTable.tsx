import React from "react";
import type { StandingRow } from "../../domain/tournament/types";

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
    return (
        <div className="tableWrap">
            <table className="table">
                <thead>
                <tr>
                    <th className="th">#</th>
                    <th className="thLeft">Player</th>
                    <th className="th">P</th>
                    <th className="th">W</th>
                    <th className="th">L</th>
                    <th className="th">Pts</th>
                    <th className="th">BM</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, idx) => (
                    <tr key={r.playerId}>
                        <td className="tdCenter">{idx + 1}</td>
                        <td className="tdLeft">{r.name}</td>
                        <td className="tdCenter">{r.played}</td>
                        <td className="tdCenter">{r.wins}</td>
                        <td className="tdCenter">{r.losses}</td>
                        <td className="tdCenter">{r.points}</td>
                        <td className="tdCenter">{r.ballDiff > 0 ? `+${r.ballDiff}` : r.ballDiff}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
